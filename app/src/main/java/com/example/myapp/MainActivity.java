package com.example.myapp;

import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import com.google.android.material.bottomnavigation.BottomNavigationView;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        BottomNavigationView bottomNavigationView = findViewById(R.id.bottom_navigation);
        bottomNavigationView.setOnNavigationItemSelectedListener(navigationItemSelectedListener);

        // Set default fragment
        getSupportFragmentManager().beginTransaction().replace(R.id.fragment_container, new LoginFragment()).commit();
    }

    private BottomNavigationView.OnNavigationItemSelectedListener navigationItemSelectedListener =
            new BottomNavigationView.OnNavigationItemSelectedListener() {
                @Override
                public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                    Fragment selectedFragment = null;

                    switch (item.getItemId()) {
                        case R.id.navigation_budgets:
                            selectedFragment = new BudgetsFragment();
                            break;
                        case R.id.navigation_customers:
                            selectedFragment = new CustomersFragment();
                            break;
                        case R.id.navigation_payment_methods:
                            selectedFragment = new PaymentMethodsFragment();
                            break;
                        case R.id.navigation_products:
                            selectedFragment = new ProductsFragment();
                            break;
                        case R.id.navigation_reports:
                            selectedFragment = new ReportsFragment();
                            break;
                    }

                    getSupportFragmentManager().beginTransaction().replace(R.id.fragment_container, selectedFragment).commit();
                    return true;
                }
            };

    public void navigateToAdminDashboard() {
        // Implementar navegação para o painel de admin
        Toast.makeText(this, "Navegando para o painel de admin", Toast.LENGTH_SHORT).show();
        // Exemplo: getSupportFragmentManager().beginTransaction().replace(R.id.fragment_container, new AdminDashboardFragment()).commit();
    }

    public void navigateToSellerDashboard() {
        // Implementar navegação para o painel de vendedor
        Toast.makeText(this, "Navegando para o painel de vendedor", Toast.LENGTH_SHORT).show();
        // Exemplo: getSupportFragmentManager().beginTransaction().replace(R.id.fragment_container, new SellerDashboardFragment()).commit();
    }

    public void navigateToLogin() {
        getSupportFragmentManager().beginTransaction().replace(R.id.fragment_container, new LoginFragment()).commit();
    }
}
