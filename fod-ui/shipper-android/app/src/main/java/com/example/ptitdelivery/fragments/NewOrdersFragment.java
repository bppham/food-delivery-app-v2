package com.example.ptitdelivery.fragments;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.example.ptitdelivery.R;
import com.example.ptitdelivery.adapter.NewOrderAdapter;
import com.example.ptitdelivery.viewmodel.NewOrdersViewModel;

public class NewOrdersFragment extends Fragment {
    private static final String TAG = "NewOrdersFragment";
    private NewOrdersViewModel viewModel;
    private SwipeRefreshLayout swipeRefreshLayout;
    private ListView lvOrders;
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view;
        view = inflater.inflate(R.layout.fragment_new_orders, container, false);
        lvOrders = view.findViewById(R.id.lvOrders);
        swipeRefreshLayout = view.findViewById(R.id.swipeRefreshLayout);

        swipeRefreshLayout.setOnRefreshListener(this::refreshData);
        swipeRefreshLayout.setOnChildScrollUpCallback((parent, child) -> {
            return lvOrders != null && lvOrders.canScrollVertically(-1);
        });
        viewModel = new ViewModelProvider(this).get(NewOrdersViewModel.class);
        swipeRefreshLayout.setRefreshing(true);
        viewModel.fetchOrders();

        viewModel.getOrders().observe(getViewLifecycleOwner(), orders -> {
            if (orders != null && !orders.isEmpty()) {
                NewOrderAdapter adapter = new NewOrderAdapter(requireContext(), orders, this);
                lvOrders.setAdapter(adapter);
            } else {
                Log.d(TAG, "Không có đơn hàng nào."); // Hoặc show "trạng thái trống" nếu cần
                lvOrders.setAdapter(null); // Clear nếu cần
            }
        });

        viewModel.getIsLoading().observe(getViewLifecycleOwner(), loading -> {
            // Điều khiển hiển thị loading của SwipeRefreshLayout
            swipeRefreshLayout.setRefreshing(loading);
        });

        viewModel.getErrorMessage().observe(getViewLifecycleOwner(), msg -> {
            Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show();
            // Nếu có lỗi thì tắt loading luôn
            swipeRefreshLayout.setRefreshing(false);
        });

        return view;
    }

    private void refreshData() {
        viewModel.fetchOrders();
    }
}
