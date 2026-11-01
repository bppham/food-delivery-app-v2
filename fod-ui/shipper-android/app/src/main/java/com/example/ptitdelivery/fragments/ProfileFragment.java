package com.example.ptitdelivery.fragments;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.bumptech.glide.Glide;
import com.example.ptitdelivery.R;
import com.example.ptitdelivery.activities.BiometricSettingActivity;
import com.example.ptitdelivery.activities.ChangePasswordActivity;
import com.example.ptitdelivery.activities.LoginActivity;
import com.example.ptitdelivery.activities.UpdatePersonalInfo;
import com.example.ptitdelivery.model.Avatar;
import com.example.ptitdelivery.model.Shipper;
import com.example.ptitdelivery.network.SocketManager;
import com.example.ptitdelivery.utils.ConvertString;
import com.example.ptitdelivery.viewmodel.ProfileViewModel;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class ProfileFragment extends Fragment {
    private static final String TAG = "Profile Fragment";
    private ProfileViewModel viewModel;
    private SwipeRefreshLayout swipeRefreshLayout;
    private ScrollView scrollView;
    private ImageView ivProfileAvatar, ivEditIcon;
    private TextView tvEmail, tvName, tvGender, tvPhoneNumber, tvVehicleName, tvVehicleNumber;
    private Button btnLogout;
    private LinearLayout layoutUpdateProfile, layoutUpdatePassword, layoutUpdateBiometric;
    private Shipper shipper;
    private ActivityResultLauncher<Intent> imagePickerLauncher;
    private String userId;

    private SocketManager socketManager;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view;
        view = inflater.inflate(R.layout.fragment_profile, container, false);
        swipeRefreshLayout = view.findViewById(R.id.swipeRefreshLayout);
        scrollView = view.findViewById(R.id.scrollView2);
        swipeRefreshLayout.setOnChildScrollUpCallback((parent, child) -> {
            return scrollView.getScrollY() > 0;
        });
        ivProfileAvatar = view.findViewById(R.id.iv_profile_image);
        tvEmail = view.findViewById(R.id.tv_profile_email);
        tvName = view.findViewById(R.id.tv_profile_name);
        tvVehicleName = view.findViewById(R.id.tv_profile_vehicle_name);
        tvVehicleNumber = view.findViewById(R.id.tv_profile_vehicle_number);
        tvGender = view.findViewById(R.id.tv_profile_gender);
        tvPhoneNumber = view.findViewById(R.id.tv_profile_phoneNumber);
        btnLogout = view.findViewById(R.id.btn_profile_logout);
        layoutUpdateProfile = view.findViewById(R.id.layout_update_profile_information);
        layoutUpdatePassword = view.findViewById(R.id.layout_update_profile_password);
        layoutUpdateBiometric = view.findViewById(R.id.layout_update_profile_biometric);
        ivEditIcon = view.findViewById(R.id.iv_edit_icon);


        // Lấy ID & Token từ SharedPreferences
        SharedPreferences sharedPreferences = getActivity().getSharedPreferences("UserPrefs", Context.MODE_PRIVATE);
        userId  = sharedPreferences.getString("id", null);
        swipeRefreshLayout.setOnRefreshListener(this::refreshData);

        imagePickerLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                        Uri selectedImageUri = result.getData().getData();
                        if (selectedImageUri != null) {
                            uploadImage(selectedImageUri);
                        }
                    }
                }
        );
        viewModel = new ViewModelProvider(this).get(ProfileViewModel.class);
        viewModel.getShipper(userId );
        observeViewModel();
        action();
        logout(sharedPreferences);
        return view;
    }


    private void refreshData() {
        viewModel.getShipper(userId);
    }

    private void observeViewModel() {
        viewModel.getIsLoadingLiveData().observe(getViewLifecycleOwner(), isLoading -> {
            if (isLoading != null) {
                swipeRefreshLayout.setRefreshing(isLoading);
            }
        });
        viewModel.getShipperLiveData().observe(getViewLifecycleOwner(), shipper -> {
            this.shipper = shipper;
            if (shipper != null) {
                updateShipperUI(shipper);
                swipeRefreshLayout.setRefreshing(false);
            }
        });
        viewModel.getErrorMessageLiveData().observe(getViewLifecycleOwner(), message -> {
            if (message != null && !message.isEmpty()) {
                Log.e(TAG, "Lỗi: " + message);
                Toast.makeText(getContext(), message, Toast.LENGTH_SHORT).show();
                swipeRefreshLayout.setRefreshing(false);
            }
        });
        viewModel.getResponseUploadLiveData().observe(getViewLifecycleOwner(), url -> {
            updateShipperUI(shipper);
        });
    }

    private void updateShipperUI(Shipper shipper) {
        tvEmail.setText(shipper.getEmail());
        tvVehicleNumber.setText(shipper.getVehicle().getVehicleNumber());
        tvVehicleName.setText(shipper.getVehicle().getVehicleType());
        tvName.setText(shipper.getName());
        String displayGender = ConvertString.convertGender(shipper.getGender());
        tvGender.setText(displayGender);
        tvPhoneNumber.setText(shipper.getPhonenumber());
        if (shipper.getAvatar() != null) {
            Glide.with(this).load(shipper.getAvatar().getUrl()).into(ivProfileAvatar);
        } else {
            ivProfileAvatar.setImageResource(R.drawable.ic_profile);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        String id = getActivity().getSharedPreferences("UserPrefs", Context.MODE_PRIVATE).getString("id", null);
        if (id != null) {
            Log.d(TAG, "onResume: Đang lấy lại dữ liệu shipper...");
            viewModel.getShipper(id);  // Gọi lại API nếu chưa có dữ liệu
        }
    }

    private void logout(SharedPreferences sharedPreferences) {
        btnLogout.setOnClickListener(v -> {
            SocketManager.disconnectSocket();
            SharedPreferences.Editor editor = sharedPreferences.edit();
            editor.clear();  // Xóa dữ liệu khi đăng xuất
            editor.apply();
            Toast.makeText(getActivity(), "Đã đăng xuất", Toast.LENGTH_SHORT).show();
            Intent intent = new Intent(getActivity(), LoginActivity.class);
            startActivity(intent);
            getActivity().finish();
        });
    }

    private void action() {
        layoutUpdateProfile.setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), UpdatePersonalInfo.class);
            intent.putExtra("shipper", shipper);
            startActivity(intent);
        });
        layoutUpdatePassword.setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), ChangePasswordActivity.class);
            startActivity(intent);
        });
        layoutUpdateBiometric.setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), BiometricSettingActivity.class);
            startActivity(intent);
        });
        ivEditIcon.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            intent.setType("image/*");
            imagePickerLauncher.launch(intent);
        });
    }

    private void uploadImage(Uri imageUri) {
        try {
            File imageFile = createTempFileFromUri(getContext(), imageUri);
            viewModel.uploadAvatar(imageFile);
        } catch (IOException e) {
            e.printStackTrace();
            Toast.makeText(getContext(), "Không thể đọc ảnh", Toast.LENGTH_SHORT).show();
        }
    }

    public File createTempFileFromUri(Context context, Uri uri) throws IOException {
        InputStream inputStream = context.getContentResolver().openInputStream(uri);
        File tempFile = File.createTempFile("temp_image", ".jpg", context.getCacheDir());
        OutputStream outputStream = new FileOutputStream(tempFile);

        byte[] buffer = new byte[4096];
        int bytesRead;
        while ((bytesRead = inputStream.read(buffer)) != -1) {
            outputStream.write(buffer, 0, bytesRead);
        }

        inputStream.close();
        outputStream.close();

        return tempFile;
    }
}
