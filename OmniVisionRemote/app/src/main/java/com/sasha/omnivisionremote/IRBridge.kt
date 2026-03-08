package com.sasha.omnivisionremote

import android.content.Context
import android.hardware.ConsumerIrManager
import android.webkit.JavascriptInterface
import android.widget.Toast

class IRBridge(private val context: Context) {

    private val irManager: ConsumerIrManager? = 
        context.getSystemService(Context.CONSUMER_IR_SERVICE) as? ConsumerIrManager

    @JavascriptInterface
    fun hasIrEmitter(): Boolean {
        val hasIr = irManager?.hasIrEmitter() ?: false
        if (!hasIr) {
            showToast("Errore: Trasmettitore IR non trovato su questo dispositivo")
        }
        return hasIr
    }

    @JavascriptInterface
    fun transmit(frequency: Int, patternStr: String) {
        val irManager = irManager ?: return
        if (!irManager.hasIrEmitter()) {
            showToast("Questo telefono non ha una porta IR")
            return
        }

        try {
            val pattern = patternStr.split(",")
                .map { it.trim().toInt() }
                .toIntArray()
            
            irManager.transmit(frequency, pattern)
            // Messaggio di debug per confermare che l'app sta provando a trasmettere
            showToast("Segnale inviato (${frequency}Hz)")
        } catch (e: Exception) {
            showToast("Errore trasmissione: ${e.message}")
            e.printStackTrace()
        }
    }

    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }
}
