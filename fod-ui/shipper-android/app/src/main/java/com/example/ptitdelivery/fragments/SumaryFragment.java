package com.example.ptitdelivery.fragments;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.GridView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModel;
import androidx.lifecycle.ViewModelProvider;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.example.ptitdelivery.R;
import com.example.ptitdelivery.adapter.HistoryOrdersAdapter;
import com.example.ptitdelivery.viewmodel.DeliveredOrdersViewModel;

import java.util.ArrayList;

public class SumaryFragment extends Fragment {
    private static final String TAG = "SummaryOrderFragment";
    private DeliveredOrdersViewModel viewModel;
    private GridView gvOrders;
    private SwipeRefreshLayout swipeRefreshLayout;
    private Button btnNext, btnPrev;
    private TextView tvPage;
    private HistoryOrdersAdapter adapter;
    private final int LIMIT = 10;
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view;
        view = inflater.inflate(R.layout.fragment_sumary, container, false);
        gvOrders = view.findViewById(R.id.gv_history_orders);
        swipeRefreshLayout = view.findViewById(R.id.swipeRefreshLayout);
        btnNext = view.findViewById(R.id.btnNext);
        btnPrev = view.findViewById(R.id.btnPrev);
        tvPage = view.findViewById(R.id.tvPageNumber);
        swipeRefreshLayout.setOnRefreshListener(this::refreshData);
        swipeRefreshLayout.setOnChildScrollUpCallback((parent, child) -> {
            return gvOrders != null && gvOrders.canScrollVertically(-1);
        });

        viewModel = new ViewModelProvider(this).get(DeliveredOrdersViewModel.class);
        // Tạo adapter một lần
        adapter = new HistoryOrdersAdapter(requireContext(), new ArrayList<>());
        gvOrders.setAdapter(adapter);

        // Gọi API lấy đơn hàng đã giao (page đầu tiên)
        Log.d(TAG, "Fetching delivered orders for page 1");
        viewModel.fetchDeliveredOrders(1, LIMIT);

        // Quan sát dữ liệu đơn hàng
        viewModel.getDeliveredOrders().observe(getViewLifecycleOwner(), orders -> {
            Log.d("SumaryFragment", "Có " + orders.size() + " đơn hàng");
            adapter.setOrders(orders);
            swipeRefreshLayout.setRefreshing(false);
        });

        // Loading
        viewModel.getIsLoading().observe(getViewLifecycleOwner(), loading -> {
            swipeRefreshLayout.setRefreshing(loading);
        });

        // Thông báo lỗi
        viewModel.getErrorMessage().observe(getViewLifecycleOwner(), msg -> {
            swipeRefreshLayout.setRefreshing(false);
            Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show();
        });

        // Tổng số trang
        viewModel.getTotalPages().observe(getViewLifecycleOwner(), totalPages -> {
            updateButtonState();
        });

        // Trang hiện tại
        viewModel.getCurrentPage().observe(getViewLifecycleOwner(), page -> {
            tvPage.setText("Trang: " + page);
            updateButtonState();
        });

        // Phân trang
        btnNext.setOnClickListener(v -> {
            swipeRefreshLayout.setRefreshing(true); // Optional: hiển thị đang load
            viewModel.nextPage(LIMIT);
        });

        btnPrev.setOnClickListener(v -> {
            swipeRefreshLayout.setRefreshing(true); // Optional: hiển thị đang load
            viewModel.previousPage(LIMIT);
        });

        return view;
    }
    private void updateButtonState() {
        Integer page = viewModel.getCurrentPage().getValue();
        Integer totalPages = viewModel.getTotalPages().getValue();

        btnPrev.setEnabled(page != null && page > 1);
        btnNext.setEnabled(page != null && totalPages != null && page < totalPages);
    }
    private void refreshData() {
        viewModel.fetchDeliveredOrders(1, LIMIT);
    }
}
