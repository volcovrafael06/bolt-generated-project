package com.persifix.app.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey
import java.util.Date

@Entity(
    tableName = "visits",
    foreignKeys = [
        ForeignKey(
            entity = CustomerEntity::class,
            parentColumns = ["id"],
            childColumns = ["customerId"]
        )
    ]
)
data class VisitEntity(
    @PrimaryKey
    val id: String,
    val customerId: String,
    val date: Date,
    val description: String,
    val status: String,
    val notes: String?,
    val syncStatus: Int = SYNC_PENDING,
    val lastModified: Long = System.currentTimeMillis()
) {
    companion object {
        const val SYNC_PENDING = 0
        const val SYNC_COMPLETE = 1
        const val SYNC_FAILED = 2
        
        const val STATUS_SCHEDULED = "SCHEDULED"
        const val STATUS_IN_PROGRESS = "IN_PROGRESS"
        const val STATUS_COMPLETED = "COMPLETED"
        const val STATUS_CANCELLED = "CANCELLED"
    }
}
