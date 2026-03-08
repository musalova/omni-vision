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
        return irManager?.hasIrEmitter() ?: false
    }

    // Restituisce le frequenze supportate dal sensore IR del telefono
    @JavascriptInterface
    fun getSupportedFrequencies(): String {
        val ranges = irManager?.carrierFrequencies ?: return ""
        return ranges.joinToString(";") { "${it.minFrequency}-${it.maxFrequency}" }
    }

    @JavascriptInterface
    fun transmit(frequency: Int, patternStr: String) {
        val irManager = irManager ?: return
        if (!irManager.hasIrEmitter()) return

        try {
            val pattern = patternStr.split(",")
                .map { it.trim().toInt() }
                .toIntArray()
            
            irManager.transmit(frequency, pattern)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // Questa funzione verrà chiamata dalla PWA per avviare il "Wizard di Scansione"
    // Invierà un segnale di test e mostrerà un feedback all'utente
    @JavascriptInterface
    fun testCode(brand: String, frequency: Int, patternStr: String) {
        transmit(frequency, patternStr)
        showToast("Provando codice per: $brand...")
    }

    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }
}
