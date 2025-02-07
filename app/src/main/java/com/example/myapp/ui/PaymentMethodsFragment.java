package com.example.myapp.ui;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.example.myapp.R;
import java.util.ArrayList;

public class PaymentMethodsFragment extends Fragment {

    private EditText paymentMethodInput, taxInput, discountInput;
    private Button addPaymentMethodButton, addTaxButton, addDiscountButton;
    private ListView paymentMethodsList, taxesList, discountsList;
    private ArrayList<String> paymentMethods, taxes, discounts;
    private ArrayAdapter<String> paymentMethodsAdapter, taxesAdapter, discountsAdapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_payment_methods, container, false);

        paymentMethodInput = view.findViewById(R.id.paymentMethodInput);
        taxInput = view.findViewById(R.id.taxInput);
        discountInput = view.findViewById(R.id.discountInput);

        addPaymentMethodButton = view.findViewById(R.id.addPaymentMethodButton);
        addTaxButton = view.findViewById(R.id.addTaxButton);
        addDiscountButton = view.findViewById(R.id.addDiscountButton);

        paymentMethodsList = view.findViewById(R.id.paymentMethodsList);
        taxesList = view.findViewById(R.id.taxesList);
        discountsList = view.findViewById(R.id.discountsList);

        paymentMethods = new ArrayList<>();
        taxes = new ArrayList<>();
        discounts = new ArrayList<>();

        paymentMethodsAdapter = new ArrayAdapter<>(getContext(), android.R.layout.simple_list_item_1, paymentMethods);
        taxesAdapter = new ArrayAdapter<>(getContext(), android.R.layout.simple_list_item_1, taxes);
        discountsAdapter = new ArrayAdapter<>(getContext(), android.R.layout.simple_list_item_1, discounts);

        paymentMethodsList.setAdapter(paymentMethodsAdapter);
        taxesList.setAdapter(taxesAdapter);
        discountsList.setAdapter(discountsAdapter);

        addPaymentMethodButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String paymentMethod = paymentMethodInput.getText().toString().trim();
                if (!paymentMethod.isEmpty()) {
                    paymentMethods.add(paymentMethod);
                    paymentMethodsAdapter.notifyDataSetChanged();
                    paymentMethodInput.setText("");
                }
            }
        });

        addTaxButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String tax = taxInput.getText().toString().trim();
                if (!tax.isEmpty()) {
                    taxes.add(tax);
                    taxesAdapter.notifyDataSetChanged();
                    taxInput.setText("");
                }
            }
        });

        addDiscountButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String discount = discountInput.getText().toString().trim();
                if (!discount.isEmpty()) {
                    discounts.add(discount);
                    discountsAdapter.notifyDataSetChanged();
                    discountInput.setText("");
                }
            }
        });

        return view;
    }
}
