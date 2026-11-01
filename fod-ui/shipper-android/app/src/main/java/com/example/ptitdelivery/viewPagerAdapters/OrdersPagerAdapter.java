package com.example.ptitdelivery.viewPagerAdapters;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentStatePagerAdapter;

import com.example.ptitdelivery.fragments.NewOrdersFragment;
import com.example.ptitdelivery.fragments.OngoingOrderFragment;

public class OrdersPagerAdapter extends FragmentStatePagerAdapter {
    public OrdersPagerAdapter(@NonNull FragmentManager fm, int behavior) {
        super(fm, behavior);
    }
    @NonNull
    @Override
    public Fragment getItem(int position) {
        switch (position) {
            case 0:
                return new NewOrdersFragment();
            case 1:
                return new OngoingOrderFragment();
            default:
                throw new IllegalStateException("Invalid position: " + position);
        }
    }

    @Override
    public int getCount() {
        return 2;
    }

    @Override
    public CharSequence getPageTitle(int position) {
        return position == 0 ? "Đơn mới" : "Đang giao";
    }
}
