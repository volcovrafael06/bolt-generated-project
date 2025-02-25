package com.persifix.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.persifix.app.ui.screens.login.LoginScreen
import com.persifix.app.ui.screens.home.HomeScreen
import com.persifix.app.ui.screens.products.ProductsScreen
import com.persifix.app.ui.screens.products.AddEditProductScreen
import com.persifix.app.ui.screens.customers.CustomersScreen
import com.persifix.app.ui.screens.customers.AddEditCustomerScreen
import com.persifix.app.ui.screens.accessories.AccessoriesScreen
import com.persifix.app.ui.screens.accessories.AddEditAccessoryScreen
import com.persifix.app.ui.screens.visits.VisitsScreen
import com.persifix.app.ui.screens.visits.AddEditVisitScreen
import com.persifix.app.ui.screens.quotes.QuotesScreen
import com.persifix.app.ui.screens.quotes.AddEditQuoteScreen
import com.persifix.app.ui.screens.reports.ReportsScreen
import com.persifix.app.ui.screens.settings.SettingsScreen

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Home : Screen("home")
    object Products : Screen("products")
    object AddEditProduct : Screen("add_edit_product?id={id}")
    object Customers : Screen("customers")
    object AddEditCustomer : Screen("add_edit_customer?id={id}")
    object Accessories : Screen("accessories")
    object AddEditAccessory : Screen("add_edit_accessory?id={id}")
    object Visits : Screen("visits")
    object AddEditVisit : Screen("add_edit_visit?id={id}")
    object Quotes : Screen("quotes")
    object AddEditQuote : Screen("add_edit_quote?id={id}")
    object Reports : Screen("reports")
    object Settings : Screen("settings")
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = Screen.Login.route) {
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Home.route) {
            HomeScreen(
                onNavigateToProducts = { navController.navigate(Screen.Products.route) },
                onNavigateToCustomers = { navController.navigate(Screen.Customers.route) },
                onNavigateToAccessories = { navController.navigate(Screen.Accessories.route) },
                onNavigateToVisits = { navController.navigate(Screen.Visits.route) },
                onNavigateToQuotes = { navController.navigate(Screen.Quotes.route) },
                onNavigateToReports = { navController.navigate(Screen.Reports.route) },
                onNavigateToSettings = { navController.navigate(Screen.Settings.route) }
            )
        }

        composable(Screen.Products.route) {
            ProductsScreen(
                onNavigateToAddProduct = { navController.navigate(Screen.AddEditProduct.route.replace("{id}", "")) },
                onNavigateToEditProduct = { id -> navController.navigate(Screen.AddEditProduct.route.replace("{id}", id)) }
            )
        }

        composable(
            route = Screen.AddEditProduct.route,
            arguments = listOf(navArgument("id") { type = NavType.StringType; nullable = true })
        ) {
            AddEditProductScreen(
                onProductSaved = { navController.popBackStack() }
            )
        }

        composable(Screen.Customers.route) {
            CustomersScreen(
                onNavigateToAddCustomer = { navController.navigate(Screen.AddEditCustomer.route.replace("{id}", "")) },
                onNavigateToEditCustomer = { id -> navController.navigate(Screen.AddEditCustomer.route.replace("{id}", id)) }
            )
        }

        composable(
            route = Screen.AddEditCustomer.route,
            arguments = listOf(navArgument("id") { type = NavType.StringType; nullable = true })
        ) {
            AddEditCustomerScreen(
                onCustomerSaved = { navController.popBackStack() }
            )
        }

        composable(Screen.Accessories.route) {
            AccessoriesScreen(
                onNavigateToAddAccessory = { navController.navigate(Screen.AddEditAccessory.route.replace("{id}", "")) },
                onNavigateToEditAccessory = { id -> navController.navigate(Screen.AddEditAccessory.route.replace("{id}", id)) }
            )
        }

        composable(
            route = Screen.AddEditAccessory.route,
            arguments = listOf(navArgument("id") { type = NavType.StringType; nullable = true })
        ) {
            AddEditAccessoryScreen(
                onAccessorySaved = { navController.popBackStack() }
            )
        }

        composable(Screen.Visits.route) {
            VisitsScreen(
                onNavigateToAddVisit = { navController.navigate(Screen.AddEditVisit.route.replace("{id}", "")) },
                onNavigateToEditVisit = { id -> navController.navigate(Screen.AddEditVisit.route.replace("{id}", id)) }
            )
        }

        composable(
            route = Screen.AddEditVisit.route,
            arguments = listOf(navArgument("id") { type = NavType.StringType; nullable = true })
        ) {
            AddEditVisitScreen(
                onVisitSaved = { navController.popBackStack() }
            )
        }

        composable(Screen.Quotes.route) {
            QuotesScreen(
                onNavigateToAddQuote = { navController.navigate(Screen.AddEditQuote.route.replace("{id}", "")) },
                onNavigateToEditQuote = { id -> navController.navigate(Screen.AddEditQuote.route.replace("{id}", id)) }
            )
        }

        composable(
            route = Screen.AddEditQuote.route,
            arguments = listOf(navArgument("id") { type = NavType.StringType; nullable = true })
        ) {
            AddEditQuoteScreen(
                onQuoteSaved = { navController.popBackStack() }
            )
        }

        composable(Screen.Reports.route) {
            ReportsScreen()
        }

        composable(Screen.Settings.route) {
            SettingsScreen()
        }
    }
}
