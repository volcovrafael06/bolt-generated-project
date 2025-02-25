package com.persifix.app.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey

@Entity(
    tableName = "quote_items",
    foreignKeys = [
        ForeignKey(
            entity = QuoteEntity::class,
            parentColumns = ["id"],
            childColumns = ["quoteId"]
        )
    ]
)
data class QuoteItemEntity(
    @PrimaryKey
    val id: String,
    val quoteId: String,
    val productId: String?,
    val accessoryId: String?,
    val quantity: Int,
    val unitPrice: Double,
    val total: Double,
    val description: String,
    val syncStatus: Int = SYNC_PENDING,
    val lastModified: Long = System.currentTimeMillis()
) {
    companion object {
        const val SYNC_PENDING = 0
        const val SYNC_COMPLETE = 1
        const val SYNC_FAILED = 2
    }
}
