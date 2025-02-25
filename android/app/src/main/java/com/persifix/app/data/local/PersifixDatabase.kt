package com.persifix.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.persifix.app.data.local.converter.DateConverter
import com.persifix.app.data.local.dao.*
import com.persifix.app.data.local.entity.*

@Database(
    entities = [
        ProductEntity::class,
        CustomerEntity::class,
        AccessoryEntity::class,
        VisitEntity::class,
        QuoteEntity::class,
        QuoteItemEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(DateConverter::class)
abstract class PersifixDatabase : RoomDatabase() {
    abstract fun productDao(): ProductDao
    abstract fun customerDao(): CustomerDao
    abstract fun accessoryDao(): AccessoryDao
    abstract fun visitDao(): VisitDao
    abstract fun quoteDao(): QuoteDao
    abstract fun quoteItemDao(): QuoteItemDao

    companion object {
        @Volatile
        private var INSTANCE: PersifixDatabase? = null

        fun getDatabase(context: Context): PersifixDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    PersifixDatabase::class.java,
                    "persifix_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
