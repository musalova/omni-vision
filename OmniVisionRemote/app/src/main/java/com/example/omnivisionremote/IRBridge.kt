package com.example.omnivisionremote

import android.content.Context
import android.hardware.ConsumerIrManager
import android.webkit.JavascriptInterface
import android.widget.Toast

class IRBridge(private val context: Context) {

    private val irManager: ConsumerIrManager? = 
        context.getSystemService(Context.CONSUMER_IR_SERVICE) as? ConsumerIrManager

    @JavascriptInterface
    fun hasIrEmitter(): Boolean {
        return irManager?.hasIrEmitter() ?: false
    }

    @JavascriptInterface
    fun transmit(frequency: Int, patternStr: String) {
        val irManager = irManager ?: return
        if (!irManager.hasIrEmitter()) return

        try {
            // Converte la stringa CSV "10,20,30" in un array di Int
            val pattern = patternStr.split(",")
                .map { it.trim().toInt() }
                .toIntArray()
            
            irManager.transmit(frequency, pattern)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }
}
