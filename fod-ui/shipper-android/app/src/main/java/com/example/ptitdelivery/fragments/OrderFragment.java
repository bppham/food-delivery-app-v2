package com.example.ptitdelivery.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.viewpager.widget.ViewPager;

import com.example.ptitdelivery.R;
import com.example.ptitdelivery.viewPagerAdapters.OrdersPagerAdapter;
import com.google.android.material.tabs.TabLayout;

public class OrderFragment extends Fragment {
    private TabLayout tabLayout;
    private ViewPager viewPager;
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view;
        view = inflater.inflate(R.layout.fragment_orders, container, false);
        return view;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        tabLayout = view.findViewById(R.id.tabLayout);
        viewPager = view.findViewById(R.id.viewPager);

        // Gán adapter cho ViewPager
        OrdersPagerAdapter adapter = new OrdersPagerAdapter(getChildFragmentManager(), OrdersPagerAdapter.BEHAVIOR_RESUME_ONLY_CURRENT_FRAGMENT);
        viewPager.setAdapter(adapter);

        // Kết nối TabLayout với ViewPager
        tabLayout.setupWithViewPager(viewPager);
    }
}
