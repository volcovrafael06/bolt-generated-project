package com.persifix.app.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey
import java.util.Date

@Entity(
    tableName = "quotes",
    foreignKeys = [
        ForeignKey(
            entity = CustomerEntity::class,
            parentColumns = ["id"],
            childColumns = ["customerId"]
        )
    ]
)
data class QuoteEntity(
    @PrimaryKey
    val id: String,
    val customerId: String,
    val date: Date,
    val total: Double,
    val status: String,
    val validUntil: Date,
    val notes: String?,
    val syncStatus: Int = SYNC_PENDING,
    val lastModified: Long = System.currentTimeMillis()
) {
    companion object {
        const val SYNC_PENDING = 0
        const val SYNC_COMPLETE = 1
        const val SYNC_FAILED = 2
        
        const val STATUS_DRAFT = "DRAFT"
        const val STATUS_SENT = "SENT"
        const val STATUS_APPROVED = "APPROVED"
        const val STATUS_REJECTED = "REJECTED"
    }
}
