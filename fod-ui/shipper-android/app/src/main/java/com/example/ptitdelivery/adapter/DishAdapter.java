package com.example.ptitdelivery.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.ptitdelivery.R;
import com.example.ptitdelivery.model.Item;
import com.example.ptitdelivery.model.Topping;

import java.util.List;

public class DishAdapter extends RecyclerView.Adapter<DishAdapter.DishViewHolder> {
    private Context context;
    private List<Item> dishList;

    public DishAdapter(Context context, List<Item> dishList) {
        this.context = context;
        this.dishList = dishList;
    }

    @NonNull
    @Override
    public DishViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_order_dish, parent, false);
        return new DishViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull DishViewHolder holder, int position) {
        Item item = dishList.get(position);

        holder.tvDishName.setText(item.getDish().getName());
        holder.tvQuantity.setText("x" + item.getQuantity());

        // Tính tổng giá
        int base = item.getDish().getPrice();
        int toppingsTotal = 0;
        for (Topping t : item.getToppings()) toppingsTotal += t.getPrice();
        int total = (base + toppingsTotal) * item.getQuantity();
        holder.tvTotalPrice.setText("Tổng: " + total + " VND");

        Glide.with(context)
                .load(item.getDish().getImage().getUrl())
                .placeholder(R.drawable.avatar) // tùy chọn ảnh chờ load
                .error(R.drawable.avatar)       // tùy chọn ảnh nếu lỗi
                .into(holder.imgDish);

        // Set topping recycler view
        ToppingAdapter toppingAdapter = new ToppingAdapter(context, item.getToppings());
        holder.rvToppings.setAdapter(toppingAdapter);
        holder.rvToppings.setLayoutManager(new LinearLayoutManager(context));
    }

    @Override
    public int getItemCount() {
        return dishList.size();
    }

    static class DishViewHolder extends RecyclerView.ViewHolder {
        ImageView imgDish;
        TextView tvDishName, tvQuantity, tvTotalPrice;
        RecyclerView rvToppings;

        public DishViewHolder(@NonNull View itemView) {
            super(itemView);
            imgDish = itemView.findViewById(R.id.imgDish);
            tvDishName = itemView.findViewById(R.id.tvDishName);
            tvQuantity = itemView.findViewById(R.id.tvQuantity);
            tvTotalPrice = itemView.findViewById(R.id.tvTotalPrice);
            rvToppings = itemView.findViewById(R.id.rvToppings);
        }
    }
}
