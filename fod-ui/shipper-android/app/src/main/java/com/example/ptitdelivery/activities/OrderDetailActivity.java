package com.example.ptitdelivery.activities;

import android.os.Bundle;
import android.util.Log;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.ptitdelivery.R;
import com.example.ptitdelivery.adapter.ToppingAdapter;
import com.example.ptitdelivery.model.Item;
import com.example.ptitdelivery.model.Order;

import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

import com.example.ptitdelivery.utils.ConvertString;

public class OrderDetailActivity extends AppCompatActivity {
    private TextView tvStoreName, tvStoreAddress, tvUserName, tvUserPhonenumber, tvShipLocation, tvPaymentMethod, tvMoneyTotal, tvStatus;
    private ImageView imgStore;
    private LinearLayout layoutDishList;
    private Toolbar toolbar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_order_detail);
        toolbar = findViewById(R.id.toolbar_detail_order);
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setDisplayShowHomeEnabled(true);

        toolbar.setNavigationOnClickListener(v -> {
            finish();
        });

        // Ánh xạ
        imgStore = findViewById(R.id.iv_detail_order_store_avatar);
        tvStoreName = findViewById(R.id.tv_detail_order_store_name);
        tvStoreAddress = findViewById(R.id.tv_detail_order_store_address);
        layoutDishList = findViewById(R.id.layout_dish_list);
        tvUserName = findViewById(R.id.tv_detail_order_user_name);
        tvUserPhonenumber = findViewById(R.id.tv_detail_order_user_phonenumber);
        tvShipLocation = findViewById(R.id.tv_detail_order_ship_location);
        tvPaymentMethod = findViewById(R.id.tv_detail_order_payment_method);
        tvMoneyTotal = findViewById(R.id.tv_detail_order_total_money);
        tvStatus = findViewById(R.id.tv_detail_order_status);

        // Lấy dữ liệu
        Order order = (Order) getIntent().getSerializableExtra("order");
        if (order != null) {
            Log.d("OrderDetailActivity", "Order received: " + order.getId());
            showStoreInfo(order);
            showUserInfo(order);
            showDishList(order.getItems());
            showOthersInfo(order);

        } else {
            Log.e("OrderDetailActivity", "Order is null!");
        }
    }

    private void showStoreInfo(Order order) {
        tvStoreName.setText(order.getStore().getName());
        tvStoreAddress.setText(order.getStore().getAddressFull());
        Glide.with(this).load(order.getStore().getAvatar().getUrl()).into(imgStore);
    }

    private void showUserInfo(Order order){
        tvUserName.setText(order.getShipInfo().getContactName());
        tvUserPhonenumber.setText(order.getShipInfo().getContactPhonenumber());
    }

    private void showDishList(List<Item> items) {
        for (Item item : items) {
            // Inflate view món ăn
            CardView  dishView = (CardView) getLayoutInflater()
                    .inflate(R.layout.item_order_dish, layoutDishList, false);

            TextView tvName = dishView.findViewById(R.id.tvDishName);
            TextView tvQuantity = dishView.findViewById(R.id.tvQuantity);
            TextView tvPrice = dishView.findViewById(R.id.tvTotalPrice);
            ImageView imgDish = dishView.findViewById(R.id.imgDish);
            RecyclerView rvToppings = dishView.findViewById(R.id.rvToppings);

            // Set text
            tvName.setText(item.getDishName());
            tvQuantity.setText("x" + item.getQuantity());

            double base = item.getPrice();
            int toppingsTotal = 0;
//            for (Topping t : item.getToppings()) toppingsTotal += t.getPrice();
//            int total = (base + toppingsTotal) * item.getQuantity();
//            tvPrice.setText("Tổng: " + total + " VND");

            tvPrice.setText(item.getPrice() + " VND");

            // Load ảnh món ăn
            if (item.getDish() == null) {
                Log.e("DEBUG_GLIDE", "❌ Dish is NULL");
            } else if (item.getDish().getImage() == null) {
                Log.e("DEBUG_GLIDE", "❌ Image object is NULL for dish: " + item.getDish().getName());
            } else if (item.getDish().getImage().getUrl() == null) {
                Log.e("DEBUG_GLIDE", "❌ Image URL is NULL for dish: " + item.getDish().getName());
            } else {
                Log.d("DEBUG_GLIDE", "✅ Loading image URL: " + item.getDish().getImage().getUrl());
                Glide.with(this)
                        .load(item.getDish().getImage().getUrl())
                        .into(imgDish);
            }

            // Topping recycler view
            ToppingAdapter adapter = new ToppingAdapter(this, item.getToppings());
            rvToppings.setAdapter(adapter);
            rvToppings.setLayoutManager(new LinearLayoutManager(this));
            rvToppings.setNestedScrollingEnabled(false);

            // Thêm vào danh sách
            layoutDishList.addView(dishView);
        }
    }

    private void showOthersInfo(Order order){
        tvShipLocation.setText(order.getShipInfo().getAddress());

        if (order.getPaymentMethod() != null && !order.getPaymentMethod().isEmpty()) {
            String displayMethod = ConvertString.convertPaymentMethod(order.getPaymentMethod());
            tvPaymentMethod.setText(displayMethod);
        } else {
            tvPaymentMethod.setText("Không xác định"); // hoặc "—" tuỳ bạn
        }

        String displayStatus = ConvertString.convertOrderStatus(order.getStatus());
        tvStatus.setText(displayStatus);

        int totalMoney = 0;
//        for (Item item : order.getItems()) {
//            int base = item.getDish().getPrice();
//            int toppingsTotal = 0;
//            for (Topping topping : item.getToppings()) {
//                toppingsTotal += topping.getPrice();
//            }
//            totalMoney += (base + toppingsTotal) * item.getQuantity();
//        }
        NumberFormat formatter = NumberFormat.getInstance(new Locale("vi", "VN"));
        tvMoneyTotal.setText(formatter.format(order.getFinalTotal()) + " VND");
    }
}