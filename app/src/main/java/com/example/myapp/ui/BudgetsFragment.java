package com.example.myapp.ui;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.Spinner;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.example.myapp.R;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;

public class BudgetsFragment extends Fragment {

    private EditText customerInput, taxInput, discountInput;
    private Spinner paymentMethodSpinner;
    private Button addTaxButton, addDiscountButton, generatePDFButton, finalizeBudgetButton, finalizeAndActivateBudgetButton;
    private ListView taxesList, discountsList;
    private ArrayList<String> taxes, discounts;
    private ArrayAdapter<String> taxesAdapter, discountsAdapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_budgets, container, false);

        customerInput = view.findViewById(R.id.customerInput);
        taxInput = view.findViewById(R.id.taxInput);
        discountInput = view.findViewById(R.id.discountInput);
        paymentMethodSpinner = view.findViewById(R.id.paymentMethodSpinner);

        addTaxButton = view.findViewById(R.id.addTaxButton);
        addDiscountButton = view.findViewById(R.id.addDiscountButton);
        generatePDFButton = view.findViewById(R.id.generatePDFButton);
        finalizeBudgetButton = view.findViewById(R.id.finalizeBudgetButton);
        finalizeAndActivateBudgetButton = view.findViewById(R.id.finalizeAndActivateBudgetButton);

        taxesList = view.findViewById(R.id.taxesList);
        discountsList = view.findViewById(R.id.discountsList);

        taxes = new ArrayList<>();
        discounts = new ArrayList<>();

        taxesAdapter = new ArrayAdapter<>(getContext(), android.R.layout.simple_list_item_1, taxes);
        discountsAdapter = new ArrayAdapter<>(getContext(), android.R.layout.simple_list_item_1, discounts);

        taxesList.setAdapter(taxesAdapter);
        discountsList.setAdapter(discountsAdapter);

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

        generatePDFButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                generatePDF();
            }
        });

        finalizeBudgetButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(getContext(), "Orçamento Finalizado", Toast.LENGTH_SHORT).show();
            }
        });

        finalizeAndActivateBudgetButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(getContext(), "Orçamento Efetivado", Toast.LENGTH_SHORT).show();
            }
        });

        return view;
    }

    private void generatePDF() {
        Document document = new Document();
        try {
            String outPath = getContext().getExternalFilesDir(null) + "/orcamento_persifix.pdf";
            PdfWriter.getInstance(document, new FileOutputStream(outPath));
            document.open();
            document.add(new Paragraph("Resumo do Orçamento PersiFIX"));
            document.add(new Paragraph("Cliente: " + customerInput.getText().toString()));
            document.add(new Paragraph("Forma de Pagamento: " + paymentMethodSpinner.getSelectedItem().toString()));
            document.add(new Paragraph("Taxas: " + taxes.toString()));
            document.add(new Paragraph("Descontos: " + discounts.toString()));
            document.close();
            Toast.makeText(getContext(), "PDF gerado com sucesso", Toast.LENGTH_SHORT).show();
        } catch (DocumentException | IOException e) {
            e.printStackTrace();
            Toast.makeText(getContext(), "Erro ao gerar PDF", Toast.LENGTH_SHORT).show();
        }
    }
}
