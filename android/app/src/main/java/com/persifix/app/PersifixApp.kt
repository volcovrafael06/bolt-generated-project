package com.persifix.app

import android.app.Application
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.GoTrue
import io.github.jan.supabase.postgrest.Postgrest

class PersifixApp : Application() {
    lateinit var supabase: SupabaseClient

    override fun onCreate() {
        super.onCreate()
        instance = this
        
        supabase = createSupabaseClient(
            supabaseUrl = "https://xkvioqjqfndsymibgarr.supabase.co",
            supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrdmlvcWpxZm5kc3ltaWJnYXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTI0MTk3OSwiZXhwIjoyMDU0ODE3OTc5fQ.XX5k8YclxuMDUYCYazsQ32LNA3pl7Cb9xT-fuKKkfU8"
        ) {
            install(GoTrue)
            install(Postgrest)
        }
    }

    companion object {
        lateinit var instance: PersifixApp
            private set
    }
}
