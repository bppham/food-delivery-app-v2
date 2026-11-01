package com.example.ptitdelivery.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.ptitdelivery.model.Topping;

import java.util.List;

public class ToppingAdapter extends RecyclerView.Adapter<ToppingAdapter.ToppingViewHolder>{
    private Context context;
    private List<Topping> toppingList;

    public ToppingAdapter(Context context, List<Topping> toppingList) {
        this.context = context;
        this.toppingList = toppingList;
    }

    @NonNull
    @Override
    public ToppingViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(android.R.layout.simple_list_item_2, parent, false);
        return new ToppingViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ToppingViewHolder holder, int position) {
        Topping topping = toppingList.get(position);
        holder.name.setText(topping.getToppingName());
        holder.price.setText(topping.getPrice() + " VND");
    }

    @Override
    public int getItemCount() {
        return toppingList.size();
    }

    static class ToppingViewHolder extends RecyclerView.ViewHolder {
        TextView name, price;

        public ToppingViewHolder(@NonNull View itemView) {
            super(itemView);
            name = itemView.findViewById(android.R.id.text1);
            price = itemView.findViewById(android.R.id.text2);
        }
    }
}
