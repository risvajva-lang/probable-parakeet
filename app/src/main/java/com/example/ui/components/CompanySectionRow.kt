package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.CinemaRed
import com.example.ui.theme.TextPrimary

data class BrandItem(
    val id: String,
    val name: String,
    val badgeColor: Color = Color(0xFF1E222B),
    val textColor: Color = Color.White
)

val POPULAR_COMPANIES = listOf(
    BrandItem("marvel", "Marvel Studios", Color(0xFFED1D24), Color.White),
    BrandItem("pixar", "PIXAR", Color(0xFF001428), Color.White),
    BrandItem("warner", "Warner Bros.", Color(0xFF003882), Color.White),
    BrandItem("paramount", "Paramount", Color(0xFF002244), Color.White),
    BrandItem("columbia", "Columbia Pictures", Color(0xFF1C1D24), Color.White),
    BrandItem("universal", "Universal", Color(0xFF0A0F24), Color.White),
    BrandItem("disney", "Disney", Color(0xFF113CCF), Color.White)
)

val POPULAR_NETWORKS = listOf(
    BrandItem("netflix", "Netflix", Color(0xFFE50914), Color.White),
    BrandItem("appletv", "Apple TV+", Color(0xFF000000), Color.White),
    BrandItem("prime", "Prime Video", Color(0xFF00A8E1), Color.White),
    BrandItem("hbo", "Max / HBO", Color(0xFF5822B4), Color.White),
    BrandItem("disneyplus", "Disney+", Color(0xFF113CCF), Color.White)
)

@Composable
fun CompanySectionRow(
    title: String,
    items: List<BrandItem>,
    onBrandClick: (BrandItem) -> Unit = {},
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 10.dp)
    ) {
        // Section Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .width(4.dp)
                    .height(18.dp)
                    .background(CinemaRed, RoundedCornerShape(2.dp))
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = title,
                color = TextPrimary,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.height(6.dp))

        // Horizontal Row of wide brand cards
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(items, key = { it.id }) { item ->
                Card(
                    modifier = Modifier
                        .width(140.dp)
                        .height(90.dp)
                        .clickable { onBrandClick(item) },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF16181F)),
                    border = BorderStroke(1.dp, Color(0xFF262A36)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            shape = RoundedCornerShape(8.dp),
                            colors = CardDefaults.cardColors(containerColor = item.badgeColor)
                        ) {
                            Box(
                                modifier = Modifier.fillMaxSize(),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = item.name,
                                    color = item.textColor,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
