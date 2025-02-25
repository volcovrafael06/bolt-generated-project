package com.persifix.app.ui.screens.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToProducts: () -> Unit,
    onNavigateToCustomers: () -> Unit,
    onNavigateToAccessories: () -> Unit,
    onNavigateToVisits: () -> Unit,
    onNavigateToQuotes: () -> Unit,
    onNavigateToReports: () -> Unit,
    onNavigateToSettings: () -> Unit
) {
    val menuItems = listOf(
        MenuItem("Products", Icons.Default.Inventory2, onNavigateToProducts),
        MenuItem("Customers", Icons.Default.People, onNavigateToCustomers),
        MenuItem("Accessories", Icons.Default.Build, onNavigateToAccessories),
        MenuItem("Visits", Icons.Default.CalendarMonth, onNavigateToVisits),
        MenuItem("Quotes", Icons.Default.Description, onNavigateToQuotes),
        MenuItem("Reports", Icons.Default.Assessment, onNavigateToReports),
        MenuItem("Settings", Icons.Default.Settings, onNavigateToSettings)
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("PersiFIX") }
            )
        }
    ) { padding ->
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            contentPadding = padding,
            modifier = Modifier.fillMaxSize()
        ) {
            items(menuItems) { item ->
                MenuCard(item)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MenuCard(item: MenuItem) {
    Card(
        onClick = item.onClick,
        modifier = Modifier
            .padding(8.dp)
            .aspectRatio(1f)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = item.title,
                modifier = Modifier.size(48.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = item.title,
                style = MaterialTheme.typography.titleMedium
            )
        }
    }
}

data class MenuItem(
    val title: String,
    val icon: ImageVector,
    val onClick: () -> Unit
)
