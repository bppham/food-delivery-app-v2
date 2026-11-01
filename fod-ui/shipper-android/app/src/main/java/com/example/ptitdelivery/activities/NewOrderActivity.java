package com.example.ptitdelivery.activities;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.os.Handler;
import android.util.Log;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.ptitdelivery.R;
import com.example.ptitdelivery.adapter.ToppingAdapter;
import com.example.ptitdelivery.model.Item;
import com.example.ptitdelivery.model.Order;
import com.example.ptitdelivery.network.retrofit.AuthRetrofitFactory;
import com.example.ptitdelivery.utils.ConvertString;
import com.example.ptitdelivery.viewmodel.NewOrdersViewModel;
import com.example.ptitdelivery.viewmodel.OrderViewModel;
import com.example.ptitdelivery.viewmodel.ProfileViewModel;

import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

public class NewOrderActivity extends AppCompatActivity {
    private static final long AUTO_DECLINE_DELAY = 30_000; // 30 giây
    private  final Handler handler = new Handler();
    private Runnable autoDeclineRunnable;
    private boolean isHandled = false;
    private TextView tvStoreName, tvStoreAddress, tvUserName, tvUserPhonenumber, tvShipLocation, tvPaymentMethod, tvMoneyTotal, tvStatus;
    private ImageView imgStore;
    private LinearLayout layoutDishList;

    private Button btnCancelOrder, btnTakeOrder;
    private OrderViewModel viewModel;
    private NewOrdersViewModel newOrdersViewModel;
    String orderId = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_new_order);
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
        btnCancelOrder = findViewById(R.id.btn_cancel_order);
        btnTakeOrder = findViewById(R.id.btn_take_order);

        viewModel = new ViewModelProvider(this).get(OrderViewModel.class);
        newOrdersViewModel = new ViewModelProvider(this).get(NewOrdersViewModel.class);
        orderId = getIntent().getStringExtra("ORDER_ID");
        Log.d("DEBUG_ORDER", "orderId received: " + orderId);
        if (orderId != null) {
            // Quan sát LiveData
            viewModel.getOrderDetail().observe(this, order -> {
                if (order != null) {
                    showStoreInfo(order);
                    showUserInfo(order);
                    showDishList(order.getItems());
                    showOthersInfo(order);
                }
            });

            // Gọi API
            viewModel.getOrder(orderId);
        }

        observeLogin();
        action();
        autoDeclineRunnable = () -> {
            if (!isHandled) {
                isHandled = true;
                Toast.makeText(this, "Đơn hàng đã bị từ chối do quá thời gian phản hồi!", Toast.LENGTH_SHORT).show();
                newOrdersViewModel.rejectOrder(orderId);
            }
        };
        handler.postDelayed(autoDeclineRunnable, AUTO_DECLINE_DELAY);


        new CountDownTimer(30_000, 1000) {
            public void onTick(long millisUntilFinished) {
                btnCancelOrder.setText("Từ chối (" + millisUntilFinished / 1000 + "s)");
            }

            public void onFinish() {
                if (!isHandled) {
                    isHandled = true;
                    newOrdersViewModel.rejectOrder(orderId);
                }
            }
        }.start();
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
            CardView dishView = (CardView) getLayoutInflater()
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

    private void observeLogin() {
        newOrdersViewModel.getIsOrderAccepted().observe(this, response -> {
            Intent intent = new Intent(this, MainActivity.class);
            startActivity(intent);
            finish();
        });

        newOrdersViewModel.getErrorMessage().observe(this, error -> {
            Toast.makeText(this, "Error: " + error, Toast.LENGTH_SHORT).show();
        });
    }
    private void action() {
        btnCancelOrder.setOnClickListener(view -> {
            if (!isHandled) {
                isHandled = true;
                handler.removeCallbacks(autoDeclineRunnable);
                newOrdersViewModel.rejectOrder(orderId);
            }
        });

        btnTakeOrder.setOnClickListener(view -> {
            if (!isHandled) {
                isHandled = true;
                handler.removeCallbacks(autoDeclineRunnable);
                newOrdersViewModel.acceptOrder(orderId);
            }
        });
    }
    @Override
    protected void onDestroy() {
        super.onDestroy();
        handler.removeCallbacks(autoDeclineRunnable);
    }

}