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

import com.bumptech.glide.Glide;
import com.example.ptitdelivery.R;
import com.example.ptitdelivery.activities.OrderDetailActivity;
import com.example.ptitdelivery.model.Order;

import java.util.List;

public class HistoryOrdersAdapter extends BaseAdapter {
    private Context context;
    private List<Order> orders;
    public HistoryOrdersAdapter(Context context, List<Order> orders) {
        this.context = context;
        this.orders = orders;
    }
    public void setOrders(List<Order> orders) {
        this.orders = orders;
        notifyDataSetChanged();
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
        ImageView ivStoreAvatar;
        TextView tvOrderId, tvStoreName, tvStoreAddress, tvShippingAddress;
        Button btnDetailOrder;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        ViewHolder holder;

        if(convertView == null) {
            convertView = LayoutInflater.from(context).inflate(R.layout.item_history_order, parent, false);
            holder = new ViewHolder();
            holder.ivStoreAvatar = convertView.findViewById(R.id.iv_history_order_store_avatar);
            holder.tvOrderId = convertView.findViewById(R.id.tv_history_order_item_id);
            holder.tvStoreName = convertView.findViewById(R.id.tv_history_order_item_store_name);
            holder.tvStoreAddress = convertView.findViewById(R.id.tv_history_order_item_store_address);
            holder.tvShippingAddress = convertView.findViewById(R.id.tv_history_order_item_shipping_address);
            holder.btnDetailOrder = convertView.findViewById(R.id.btn_history_order_item_detail);
            convertView.setTag(holder);
        } else {
            holder = (ViewHolder) convertView.getTag();
        }

        Order order = orders.get(position);

        // Store info
        holder.tvStoreName.setText(order.getStore().getName());
        holder.tvStoreAddress.setText(order.getStore().getAddressFull());
        Glide.with(context)
                .load(order.getStore().getAvatar().getUrl()  )
                .placeholder(R.drawable.avatar)
                .error(R.drawable.avatar)
                .into(holder.ivStoreAvatar);

        // Order info
        holder.tvOrderId.setText(order.getId());
        holder.tvShippingAddress.setText(order.getShipInfo().getAddress());

        // Detail order
        holder.btnDetailOrder.setOnClickListener(v -> {
            Intent intent = new Intent(context, OrderDetailActivity.class);
            intent.putExtra("order", order);
            context.startActivity(intent);
        });
        return convertView;
    }
}
