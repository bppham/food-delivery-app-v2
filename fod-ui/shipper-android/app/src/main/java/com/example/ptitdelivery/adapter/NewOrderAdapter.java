package com.example.ptitdelivery.adapter;

import android.content.Context;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;
import androidx.lifecycle.LifecycleOwner;
import androidx.lifecycle.ViewModelProvider;

import com.example.ptitdelivery.R;
import com.example.ptitdelivery.activities.OrderDetailActivity;
import com.example.ptitdelivery.fragments.OngoingOrderFragment;
import com.example.ptitdelivery.model.Order;
import com.example.ptitdelivery.utils.DialogHelper;
import com.example.ptitdelivery.viewmodel.NewOrdersViewModel;

import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

public class NewOrderAdapter extends BaseAdapter {
    private Context context;
    private List<Order> orders;
    private Fragment fragment;
    public NewOrderAdapter(Context context, List<Order> orders, Fragment fragment) {
        this.context = context;
        this.orders = orders;
        this.fragment = fragment; // Lưu Fragment để sử dụng sau này
    }
    @Override
    public int getCount() {
        return orders.size();
    }

    @Override
    public Object getItem(int i) {
        return orders.get(i);
    }

    @Override
    public long getItemId(int i) {
        return 0;
    }

    static class ViewHolder {
        ImageView imgStoreAvatar;
        TextView tvStoreName, tvStoreAddress;
        TextView tvUserInfo, tvShipLocation, tvPaymentMethod, tvMoneyTotal;
        Button btnAcceptOrder, btnViewDetails;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        ViewHolder holder;

        if (convertView == null) {
            convertView = LayoutInflater.from(context).inflate(R.layout.item_new_order, parent, false);
            holder = new ViewHolder();
            holder.tvStoreName = convertView.findViewById(R.id.tvStoreName);
            holder.tvStoreAddress = convertView.findViewById(R.id.tvStoreAddress);
            holder.tvUserInfo = convertView.findViewById(R.id.tvUserInfo);
            holder.tvShipLocation = convertView.findViewById(R.id.tvShipLocation);
            holder.tvPaymentMethod = convertView.findViewById(R.id.tvPaymentMethod);
            holder.tvMoneyTotal = convertView.findViewById(R.id.tvMoneyTotal);
            holder.btnAcceptOrder = convertView.findViewById(R.id.btnAcceptOrder);
            holder.btnViewDetails = convertView.findViewById(R.id.btnViewDetails);
            convertView.setTag(holder);
        } else {
            holder = (ViewHolder) convertView.getTag();
        }

        Order order = orders.get(position);
        // Store info
        String displayStoreName = "🔴 " + order.getStore().getName();
        holder.tvStoreName.setText(displayStoreName);
        holder.tvStoreAddress.setText(order.getStore().getAddressFull());

        // User Info
        if (order.getShipInfo() != null) {
            String displayCustomeInfo = "🟢 "
                    + order.getShipInfo().getContactName()
                    + " - "
                    + order.getShipInfo().getContactPhonenumber();
            holder.tvUserInfo.setText(displayCustomeInfo);
            holder.tvShipLocation.setText(order.getShipInfo().getAddress());
        } else {
            holder.tvUserInfo.setText("⚪ Chưa có thông tin giao hàng");
            holder.tvShipLocation.setText("Đang cập nhật...");
        }
        // Payment method
        // String paymentMethod = order.getPaymentMethod();
        // String displayMethod = ConvertString.convertPaymentMethod(paymentMethod);

        // holder.tvPaymentMethod.setText("💳 " + displayMethod);

        // Total money
//        int totalMoney = 0;
//        for (Item item : order.getItems()) {
//            int dishPrice = item.getDish().getPrice();
//            int toppingPrice = 0;
//            for (Topping topping : item.getToppings()) {
//                toppingPrice += topping.getPrice();
//            }
//            totalMoney += (dishPrice + toppingPrice) * item.getQuantity();
//        }
//
        NumberFormat formatter = NumberFormat.getInstance(new Locale("vi", "VN"));
         holder.tvMoneyTotal.setText(formatter.format(order.getFinalTotal()) + " VND");

        holder.btnViewDetails.setOnClickListener(v -> {
            Intent intent = new Intent(context, OrderDetailActivity.class);
            intent.putExtra("order", order);
            context.startActivity(intent);
        });

        holder.btnAcceptOrder.setOnClickListener(v -> {
            String orderId = order.getId();
            NewOrdersViewModel orderViewModel = new ViewModelProvider(fragment).get(NewOrdersViewModel.class);

            // 👉 Hiển thị dialog xác nhận trước khi nhận đơn
            DialogHelper.showConfirmDialog(context, "Bạn có chắc muốn nhận đơn hàng này không?", () -> {
                orderViewModel.acceptOrder(orderId);

                // Quan sát kết quả nhận đơn
                orderViewModel.getIsOrderAccepted().observe((LifecycleOwner) fragment.getViewLifecycleOwner(), isAccepted -> {
                    if (isAccepted != null && isAccepted) {
                        DialogHelper.showSuccessDialog(context, "Nhận đơn hàng thành công!");

                        // 👉 Xóa đơn khỏi danh sách và cập nhật lại ListView
                        if (position >= 0 && position < orders.size()) {
                            orders.remove(position);
                            notifyDataSetChanged();
                        }

                        // 👉 Chuyển sang OngoingOrderFragment
                        FragmentManager fragmentManager = fragment.getParentFragmentManager();
                        FragmentTransaction transaction = fragmentManager.beginTransaction();
                        transaction.replace(R.id.fragment_new_orders, new OngoingOrderFragment());
                        transaction.addToBackStack(null);
                        transaction.commit();
                    } else {
                        DialogHelper.showErrorDialog(context, "Không thể nhận đơn hàng!");
                    }
                });
            });
        });

        return convertView;
    }
}
