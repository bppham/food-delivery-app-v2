package com.example.ptitdelivery.activities;

import static android.content.ContentValues.TAG;

import android.content.Intent;
import android.content.IntentSender;
import android.os.Bundle;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.location.Location;
import android.os.Build;

import android.util.Log;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.ViewModelProvider;

import org.json.JSONArray;
import org.json.JSONObject;
import org.osmdroid.config.Configuration;
import org.osmdroid.events.MapEventsReceiver;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.MapEventsOverlay;
import org.osmdroid.views.overlay.Marker;
import org.osmdroid.views.overlay.Polyline;

import com.example.ptitdelivery.model.Order;
import com.example.ptitdelivery.network.SocketManager;
import com.example.ptitdelivery.viewmodel.OrderViewModel;
import com.example.ptitdelivery.viewmodel.RoutingOrderViewModel;
import com.google.android.gms.common.api.ResolvableApiException;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import com.example.ptitdelivery.R;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.LocationSettingsRequest;
import com.google.android.gms.location.LocationSettingsResponse;
import com.google.android.gms.location.SettingsClient;
import com.google.android.gms.tasks.Task;

public class SeeRouteToCustomerActivity extends AppCompatActivity implements MapEventsReceiver{
    private MapView mapView;
    private FusedLocationProviderClient fusedLocationClient;
    private OrderViewModel viewModel;
    private RoutingOrderViewModel routingViewModel;
    private String orderId;
    private Order order;
    private Marker customerMarker, shipperMarker;
    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1;
    private LocationCallback locationCallback;
    private LocationRequest locationRequest;
    private Double customerLatitude, customerLongitude;
    private Polyline storePolyline;
    private Polyline customerPolyline;
    private Toolbar toolbar;
    private static final int REQUEST_CHECK_SETTINGS = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_see_route_to_customer);

        mapView = findViewById(R.id.mapView);
        toolbar = findViewById(R.id.toolbar_see_route_to_customer);
        toolbar.setNavigationOnClickListener(v -> {
            finish();
        });

        order = (Order) getIntent().getSerializableExtra("order");
        orderId = order.getId();
        checkGpsAndRequestIfDisabled();
        viewModel = new ViewModelProvider(this).get(OrderViewModel.class);

        routingViewModel = new ViewModelProvider(this).get(RoutingOrderViewModel.class);
        routingViewModel.getDetailOrder(orderId);

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        Configuration.getInstance().load(this, getPreferences(MODE_PRIVATE));
        mapView.setTileSource(TileSourceFactory.MAPNIK);
        mapView.setMultiTouchControls(true);
        mapView.getController().setZoom(15.0);

        MapEventsOverlay eventsOverlay = new MapEventsOverlay((MapEventsReceiver) this);
        mapView.getOverlays().add(eventsOverlay);

        if (checkLocationPermission()) {
            getCurrentLocation();
        } else {
            requestLocationPermission();
        }

        observeViewModel();

        SocketManager.joinOrder(orderId);
        SocketManager.setOnLocationUpdatedListener(args -> {
            Log.d("SeeRouteActivity", "🔥 Received updateLocation event");
            runOnUiThread(() -> {
                try {
                    if (args.length > 0 && args[0] instanceof JSONObject) {
                        JSONObject json = (JSONObject) args[0];

                        // Format từ server: { id: orderId, data: { latitude, longitude } }
                        JSONObject data = json.getJSONObject("data");

                        double lat = data.getDouble("latitude");
                        double lon = data.getDouble("longitude");

                        Log.d("SeeRouteActivity", "📍 Received location from socket: " + lat + ", " + lon);

                        // Cập nhật marker người giao hàng
                        addShipperMarker(lat, lon);

                        // Cập nhật lại route
                        updateRouteToCustomer(lat, lon);

                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        });
        locationRequest = LocationRequest.create();
        locationRequest.setInterval(5000); // 5 giây
        locationRequest.setFastestInterval(3000); // tối thiểu 3 giây
        locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);

        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {
                if (locationResult == null) return;

                Location location = locationResult.getLastLocation();
                if (location != null) {
                    double latitude = location.getLatitude();
                    double longitude = location.getLongitude();

                    addShipperMarker(latitude, longitude);
                    updateRouteToCustomer(latitude, longitude);

                    try {
                        JSONObject dataObject = new JSONObject();
                        dataObject.put("latitude", latitude);
                        dataObject.put("longitude", longitude);

                        JSONObject locationObject = new JSONObject();
                        locationObject.put("id", orderId);
                        locationObject.put("data", dataObject);

                        SocketManager.sendLocation(locationObject);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        };

        if (ActivityCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, null);
        }
    }

    private void checkGpsAndRequestIfDisabled() {
        LocationRequest locationRequest = LocationRequest.create()
                .setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);

        LocationSettingsRequest.Builder builder = new LocationSettingsRequest.Builder()
                .addLocationRequest(locationRequest);

        SettingsClient client = LocationServices.getSettingsClient(this);
        Task<LocationSettingsResponse> task = client.checkLocationSettings(builder.build());

        task.addOnSuccessListener(locationSettingsResponse -> {
            // GPS đã bật, làm gì tiếp thì làm (ví dụ gọi lấy location)
        });

        task.addOnFailureListener(e -> {
            if (e instanceof ResolvableApiException) {
                try {
                    ResolvableApiException resolvable = (ResolvableApiException) e;
                    resolvable.startResolutionForResult(this, REQUEST_CHECK_SETTINGS);
                } catch (IntentSender.SendIntentException sendEx) {
                    // Xử lý lỗi nếu cần
                }
            } else {
                Toast.makeText(this, "Vui lòng bật GPS để sử dụng chức năng", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_CHECK_SETTINGS) {
            if (resultCode == RESULT_OK) {
                // Người dùng đã bật GPS, làm gì tiếp thì làm
            } else {
                Toast.makeText(this, "Bạn cần bật định vị để sử dụng", Toast.LENGTH_SHORT).show();
            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        SocketManager.leaveOrder(orderId);
        fusedLocationClient.removeLocationUpdates(locationCallback);
    }

    @Override
    public boolean singleTapConfirmedHelper(GeoPoint p) {
        moveMapToLocation(p.getLatitude(), p.getLongitude());
        mapView.invalidate();
        return true;
    }

    @Override
    public boolean longPressHelper(GeoPoint p) {
        moveMapToLocation(p.getLatitude(), p.getLongitude());
        mapView.invalidate();
        return true;
    }
    private boolean checkLocationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        } else {
            return true;
        }
    }
    private void requestLocationPermission() {
        if (ActivityCompat.shouldShowRequestPermissionRationale(this, android.Manifest.permission.ACCESS_FINE_LOCATION)) {
            Toast.makeText(this, "Please allow location access to continue", Toast.LENGTH_SHORT).show();
        }
        ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.ACCESS_FINE_LOCATION}, LOCATION_PERMISSION_REQUEST_CODE);
    }
    private void observeViewModel() {
        routingViewModel.getDetailOrderLiveData().observe(this, order -> {
            if (order != null) {
                Log.d("SeeRouteActivity", "Đã lấy được đơn hàng: " + order.getId());
                addCustomerMarker(order.getShipInfo().getShipLocation().getCoordinates()[1], order.getShipInfo().getShipLocation().getCoordinates()[0]);
            } else {
                // Không có đơn hàng
                Log.d("SeeRouteActivity", "Error: Không có đơn hàng");
            }
        });

        routingViewModel.getErrorMessageLiveData().observe(this, message -> {
            if (message != null && !message.isEmpty()) {
                Log.e(TAG, "Lỗi: " + message);
                Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
            }
        });
    }
    private Drawable resizeDrawable(int drawableId, int width, int height) {
        Drawable image = getResources().getDrawable(drawableId);
        Bitmap bitmap = ((BitmapDrawable) image).getBitmap();
        Bitmap resized = Bitmap.createScaledBitmap(bitmap, width, height, false);
        return new BitmapDrawable(getResources(), resized);
    }
    private void addCustomerMarker(double latitude, double longitude) {
        GeoPoint fixedPoint = new GeoPoint(latitude, longitude);
        customerLatitude = latitude;
        customerLongitude = longitude;

        // Tạo marker cố định nếu chưa có
        if (customerMarker == null) {
            customerMarker = new Marker(mapView);
            customerMarker.setPosition(fixedPoint);
            customerMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
            customerMarker.setTitle("Người đặt");
            customerMarker.setIcon(resizeDrawable(R.drawable.ic_home_marker, 24, 24));
            customerMarker.setDraggable(false);
            mapView.getOverlays().add(customerMarker);
            moveMapToLocation(latitude, longitude);
        }

        mapView.invalidate();
    }
    private void addShipperMarker(double latitude, double longitude) {
        GeoPoint fixedPoint = new GeoPoint(latitude, longitude);

        if (shipperMarker == null) {
            shipperMarker = new Marker(mapView);
            shipperMarker.setPosition(fixedPoint);
            shipperMarker.setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM);
            shipperMarker.setTitle("Shipper");
            shipperMarker.setIcon(resizeDrawable(R.drawable.ic_shipper_marker, 24, 24));
            shipperMarker.setDraggable(false);
            mapView.getOverlays().add(shipperMarker);
            moveMapToLocation(latitude, longitude);
        }

        mapView.invalidate();
    }
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                getCurrentLocation();
            } else {
                Toast.makeText(this, "Permission denied", Toast.LENGTH_SHORT).show();
            }
        }
    }
    private void getCurrentLocation() {
        if (ActivityCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        fusedLocationClient.getLastLocation()
                .addOnCompleteListener(this, task -> {
                    if (task.isSuccessful() && task.getResult() != null) {
                        Location location = task.getResult();
                        double latitude = location.getLatitude();
                        double longitude = location.getLongitude();

                        moveMapToLocation(latitude, longitude);
                        addShipperMarker(latitude, longitude);
                    }
                });
    }
    private void updateRouteToCustomer(double shipperLat, double shipperLon) {
        Log.d("SeeRouteActivity", "📍 Draw new route: " + shipperLat + ", " + shipperLon);
        if (customerLatitude == null || customerLongitude == null) return;

        String url = "https://router.project-osrm.org/route/v1/driving/" +
                shipperLon + "," + shipperLat + ";" + customerLongitude + "," + customerLatitude +
                "?overview=full&geometries=geojson";

        new Thread(() -> {
            HttpURLConnection connection = null;
            try {
                URL apiUrl = new URL(url);
                connection = (HttpURLConnection) apiUrl.openConnection();
                connection.setRequestMethod("GET");
                connection.setConnectTimeout(5000);
                connection.setReadTimeout(5000);
                connection.setRequestProperty("User-Agent", "MyApp/1.0");

                int responseCode = connection.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    InputStream inputStream = connection.getInputStream();
                    BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
                    StringBuilder responseBuilder = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        responseBuilder.append(line);
                    }
                    reader.close();

                    JSONObject json = new JSONObject(responseBuilder.toString());
                    JSONArray routes = json.getJSONArray("routes");

                    if (routes.length() > 0) {
                        JSONObject geometry = routes.getJSONObject(0).getJSONObject("geometry");
                        JSONArray coordinates = geometry.getJSONArray("coordinates");

                        List<GeoPoint> geoPoints = new ArrayList<>();
                        for (int i = 0; i < coordinates.length(); i++) {
                            JSONArray coord = coordinates.getJSONArray(i);
                            double lon = coord.getDouble(0);
                            double lat = coord.getDouble(1);
                            geoPoints.add(new GeoPoint(lat, lon));
                        }

                        runOnUiThread(() -> {
                            if (customerPolyline != null) {
                                mapView.getOverlays().remove(customerPolyline);
                            }

                            customerPolyline = new Polyline();
                            customerPolyline.setPoints(geoPoints);
                            customerPolyline.setColor(Color.RED);
                            customerPolyline.setWidth(5f);
                            mapView.getOverlays().add(customerPolyline);
                            mapView.invalidate();
                        });
                    }

                } else {
                    Log.e("ROUTE_ERROR", "OSRM server returned code: " + responseCode);
                }

            } catch (Exception e) {
                e.printStackTrace();
                runOnUiThread(() -> Toast.makeText(this, "Lỗi khi lấy route từ OSRM", Toast.LENGTH_SHORT).show());
            } finally {
                if (connection != null) connection.disconnect();
            }
        }).start();
    }
    private void moveMapToLocation(double latitude, double longitude) {
        GeoPoint newLocation = new GeoPoint(latitude, longitude);
        mapView.getController().animateTo(newLocation);
        mapView.invalidate();
    }
}