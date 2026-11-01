package com.example.ptitdelivery.activities;

import android.Manifest;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.ConnectivityManager;
import android.os.Bundle;
import android.os.Looper;
import android.util.Log;
import android.view.MenuItem;
import android.widget.Switch;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.fragment.app.FragmentStatePagerAdapter;
import androidx.lifecycle.ViewModelProvider;
import androidx.viewpager.widget.ViewPager;

import com.example.ptitdelivery.R;
import com.example.ptitdelivery.broadcast.InternetBroadcastReceiver;
import com.example.ptitdelivery.model.Requests.UpdateLocationRequest;
import com.example.ptitdelivery.model.Requests.UpdateOnlineStatusRequest;
import com.example.ptitdelivery.network.SocketManager;
import com.example.ptitdelivery.viewPagerAdapters.ViewPagerAdapter;
import com.example.ptitdelivery.viewmodel.ProfileViewModel;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;
import com.google.android.material.bottomnavigation.BottomNavigationView;

public class MainActivity extends AppCompatActivity {
    private TextView toolbarTitle;
    private Switch toolbarSwitch;
    private ViewPager mViewPager;
    private BottomNavigationView mBottomNavigationView;
    private InternetBroadcastReceiver broadcastReceiver;
    private ProfileViewModel viewModel;
    private FusedLocationProviderClient fusedLocationProviderClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        broadcastReceiver = new InternetBroadcastReceiver();
        toolbarTitle = findViewById(R.id.toolbar_title);
        toolbarSwitch = findViewById(R.id.toolbar_switch);
        mViewPager = findViewById(R.id.view_pager);
        mBottomNavigationView = findViewById(R.id.bottom_navigation);
        SharedPreferences sp = getSharedPreferences("UserPrefs", MODE_PRIVATE);
        String shipperId = sp.getString("id", null);

        SocketManager.connectSocket(MainActivity.this);
        ViewPagerAdapter viewPagerAdapter = new ViewPagerAdapter(getSupportFragmentManager(), FragmentStatePagerAdapter.BEHAVIOR_RESUME_ONLY_CURRENT_FRAGMENT);
        mViewPager.setAdapter(viewPagerAdapter);
        mViewPager.setCurrentItem(0);

        mViewPager.setOnPageChangeListener(new ViewPager.OnPageChangeListener() {
            @Override
            public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {}

            @Override
            public void onPageSelected(int position) {
                switch (position) {
                    case 0:
                        toolbarTitle.setText("Đơn hàng");
                        mBottomNavigationView.getMenu().findItem(R.id.nav_orders).setChecked(true);
                        break;
                    case 1:
                        toolbarTitle.setText("Tổng kết");
                        mBottomNavigationView.getMenu().findItem(R.id.nav_summary).setChecked(true);
                        break;
                    case 2:
                        toolbarTitle.setText("Tài khoản");
                        mBottomNavigationView.getMenu().findItem(R.id.nav_profile).setChecked(true);
                        break;
                }
            }
            @Override
            public void onPageScrollStateChanged(int state) {}
        });
        mBottomNavigationView.setOnNavigationItemSelectedListener(new BottomNavigationView.OnNavigationItemSelectedListener() {
            @Override
            public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                switch (item.getItemId()) {
                    case R.id.nav_orders:
                        mViewPager.setCurrentItem(0);
                        break;
                    case R.id.nav_summary:
                        mViewPager.setCurrentItem(1);
                        break;
                    case R.id.nav_profile:
                        mViewPager.setCurrentItem(2);
                        break;
                }
                return true;
            }
        });

        // Heartbeat
        viewModel = new ViewModelProvider(this).get(ProfileViewModel.class);
        viewModel.getShipper(shipperId);

        viewModel.getShipperLiveData().observe(this, shipper -> {
            if (shipper != null) {
                toolbarSwitch.setOnCheckedChangeListener(null);
                toolbarSwitch.setChecked(shipper.isOnline());

                toolbarSwitch.setOnCheckedChangeListener((buttonView, isChecked) -> {
                    Log.d("SHIPPER STATUS", "Switch toggled: " + isChecked);

                    // Gửi trạng thái mong muốn hiện tại, không dùng giá trị cũ
                    UpdateOnlineStatusRequest request = new UpdateOnlineStatusRequest(isChecked);
                    viewModel.updateOnlineStatus(request);
                });
            }
        });
//        toolbarSwitch.setOnCheckedChangeListener((buttonView, isChecked, shipper) -> {
//            if (viewModel.getShipperLiveData().getValue() != null) {
//                // Gọi API update online status
//                UpdateOnlineStatusRequest request = new UpdateOnlineStatusRequest(shipper.)
//                viewModel.updateOnlineStatus();
//                Log.d("SHIPPER STATUS", "Switch toggled: " + isChecked);
//            }
//        });
        fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(this);
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, 100);
            return;
        }
        LocationRequest locationRequest = LocationRequest.create();
        locationRequest.setInterval(30000); // 30s
        locationRequest.setFastestInterval(15000);
        locationRequest.setPriority(Priority.PRIORITY_HIGH_ACCURACY);

        fusedLocationProviderClient.requestLocationUpdates(locationRequest,
                new LocationCallback() {
                    @Override
                    public void onLocationResult(LocationResult locationResult) {
                        if (locationResult == null) {
                            Log.d("LOCATION", "LocationResult null");
                            return;
                        }
                        double lat = locationResult.getLastLocation().getLatitude();
                        double lon = locationResult.getLastLocation().getLongitude();
                        Log.d("LOCATION", "Received location update: lat=" + lat + ", lon=" + lon);
                        UpdateLocationRequest request = new UpdateLocationRequest();
                        request.setLat(lat);
                        request.setLon(lon);
                        viewModel.startHeartbeat(request);
                    }
                },
                Looper.getMainLooper());


    }
    @Override
    protected void onStart() {
        super.onStart();
        IntentFilter intentFilter = new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION);
        registerReceiver(broadcastReceiver,intentFilter);
    }

    @Override
    protected void onStop() {
        super.onStop();
        unregisterReceiver(broadcastReceiver);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy(); viewModel.stopHeartbeat();
    }

}