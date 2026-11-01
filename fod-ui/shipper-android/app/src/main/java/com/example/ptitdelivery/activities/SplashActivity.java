package com.example.ptitdelivery.activities;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.example.ptitdelivery.R;
import com.example.ptitdelivery.utils.TokenManager;

public class SplashActivity extends AppCompatActivity {

    private static int SLASH_SCREEN = 5000;
    Animation topAnima, bottomAnim;
    ImageView image;
    TextView logo, slogan;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        topAnima = AnimationUtils.loadAnimation(this, R.anim.top_animation);
        bottomAnim = AnimationUtils.loadAnimation(this, R.anim.bottom_animation);

        // Hooks
        image = findViewById(R.id.imageView);
        logo = findViewById(R.id.textViewLogo);
        slogan = findViewById(R.id.textViewSlogan);

        image.setAnimation(topAnima);
        logo.setAnimation(bottomAnim);
        slogan.setAnimation(bottomAnim);

        // Lấy token
        TokenManager tokenManager = new TokenManager(this);
        String token = tokenManager.getToken();


        new Handler().postDelayed(() -> {
            Intent intent;
            if (token == null || token.trim().isEmpty()) {
                intent = new Intent(SplashActivity.this, LoginActivity.class);
            } else {
                intent = new Intent(SplashActivity.this, MainActivity.class);
            }
            startActivity(intent);
            finish();
        }, SLASH_SCREEN);
    }
}
