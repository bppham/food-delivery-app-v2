package com.example.ptitdelivery.activities;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Switch;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.example.ptitdelivery.R;
import com.google.android.material.switchmaterial.SwitchMaterial;

public class BiometricSettingActivity extends AppCompatActivity {
    private SwitchMaterial switchFingerprint;
    private SharedPreferences sharedPreferences;
    private String userId;
    private Toolbar toolbar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_biometric_setting);
        switchFingerprint = findViewById(R.id.switchFingerprint);
        toolbar = findViewById(R.id.toolbar_biometric_setting);
        toolbar.setNavigationOnClickListener(v -> {
            finish();
        });
        sharedPreferences = getSharedPreferences("UserPrefs", MODE_PRIVATE);

        userId = sharedPreferences.getString("id", null);
        boolean isFingerprintEnabled = sharedPreferences.getBoolean("fingerprint_enabled_" + userId, false);
        switchFingerprint.setChecked(isFingerprintEnabled);

        switchFingerprint.setOnCheckedChangeListener((buttonView, isChecked) -> {
            SharedPreferences.Editor editor = sharedPreferences.edit();
            editor.putBoolean("fingerprint_enabled_" + userId, isChecked);
            editor.apply();
            Toast.makeText(this, isChecked ? "Đã bật vân tay" : "Đã tắt vân tay", Toast.LENGTH_SHORT).show();
        });
    }
}