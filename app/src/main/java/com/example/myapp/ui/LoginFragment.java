package com.example.myapp.ui;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.example.myapp.MainActivity;
import com.example.myapp.R;

public class LoginFragment extends Fragment {

    private EditText usernameInput, passwordInput;
    private Button loginButton, logoutButton;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_login, container, false);

        usernameInput = view.findViewById(R.id.usernameInput);
        passwordInput = view.findViewById(R.id.passwordInput);
        loginButton = view.findViewById(R.id.loginButton);
        logoutButton = view.findViewById(R.id.logoutButton);

        loginButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String username = usernameInput.getText().toString();
                String password = passwordInput.getText().toString();

                if (username.equals("admin") && password.equals("admin")) {
                    ((MainActivity) getActivity()).navigateToAdminDashboard();
                } else if (username.equals("vendedor") && password.equals("vendedor")) {
                    ((MainActivity) getActivity()).navigateToSellerDashboard();
                } else {
                    Toast.makeText(getContext(), "Credenciais inválidas", Toast.LENGTH_SHORT).show();
                }
            }
        });

        logoutButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                logout();
            }
        });

        return view;
    }

    private void logout() {
        // Implementar lógica de logout
        Toast.makeText(getContext(), "Logout realizado", Toast.LENGTH_SHORT).show();
        // Redirecionar para a tela de login
        ((MainActivity) getActivity()).navigateToLogin();
    }
}
