package com.example.player.bridge

import android.content.Context

/**
 * VideoPulsePackage registers and exposes the VideoPulseModule
 * within the application architecture.
 */
class VideoPulsePackage(private val context: Context) {

    val module: VideoPulseModule by lazy {
        VideoPulseModule(context.applicationContext ?: context)
    }

    fun createModule(): VideoPulseModule {
        return module
    }

    companion object {
        @Volatile
        private var instance: VideoPulsePackage? = null

        fun getInstance(context: Context): VideoPulsePackage {
            return instance ?: synchronized(this) {
                instance ?: VideoPulsePackage(context).also { instance = it }
            }
        }
    }
}
