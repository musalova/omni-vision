package com.sasha.omnivisionremote

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.ConsumerIrManager
import android.net.Uri
import android.os.Environment
import android.webkit.JavascriptInterface
import android.widget.Toast
import androidx.core.content.FileProvider
import java.io.File

class IRBridge(private val context: Context) {

    private val irManager: ConsumerIrManager? = 
        context.getSystemService(Context.CONSUMER_IR_SERVICE) as? ConsumerIrManager

    // Codici Power di base per test (Samsung, LG, Sony, Panasonic)
    private val commonCodes = mapOf(
        "Samsung" to intArrayOf(169, 169, 21, 63, 21, 63, 21, 63, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 63, 21, 63, 21, 63, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 63, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 63, 21, 21, 21, 63, 21, 63, 21, 63, 21, 63, 21, 63, 21, 1794),
        "LG" to intArrayOf(9000, 4500, 560, 560, 560, 560, 560, 1690, 560, 560, 560, 560, 560, 560, 560, 560, 560, 560, 560, 1690, 560, 1690, 560, 560, 560, 1690, 560, 1690, 560, 1690, 560, 1690, 560, 1690, 560, 560, 560, 560, 560, 560, 560, 1690, 560, 560, 560, 560, 560, 560, 560, 560, 560, 1690, 560, 1690, 560, 560, 560, 1690, 560, 1690, 560, 1690, 560, 1690, 560, 1690, 560, 40000),
        "Sony" to intArrayOf(2400, 600, 1200, 600, 600, 600, 1200, 600, 600, 600, 1200, 600, 600, 600, 600, 600, 1200, 600, 600, 600, 600, 600, 600, 600, 1200, 600)
    )

    @JavascriptInterface
    fun hasIrEmitter(): Boolean = irManager?.hasIrEmitter() ?: false

    @JavascriptInterface
    fun startAutoScan() {
        if (!hasIrEmitter()) {
            showToast("Il tuo telefono non ha un trasmettitore IR")
            return
        }
        
        Thread {
            for ((brand, pattern) in commonCodes) {
                (context as? android.app.Activity)?.runOnUiThread {
                    showToast("Provando codice per: $brand...")
                }
                irManager?.transmit(38000, pattern)
                Thread.sleep(2000) // Aspetta 2 secondi tra un tentativo e l'altro
            }
            (context as? android.app.Activity)?.runOnUiThread {
                showToast("Scansione terminata. Se la TV non ha risposto, serve il codice specifico.")
            }
        }.start()
    }

    @JavascriptInterface
    fun transmit(frequency: Int, patternStr: String) {
        val irManager = irManager ?: return
        try {
            val pattern = patternStr.split(",").map { it.trim().toInt() }.toIntArray()
            irManager.transmit(frequency, pattern)
        } catch (e: Exception) { e.printStackTrace() }
    }

    @JavascriptInterface
    fun updateApp(apkUrl: String) {
        val destination = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS).toString() + "/update.apk"
        val file = File(destination)
        val request = DownloadManager.Request(Uri.parse(apkUrl))
            .setDestinationUri(Uri.fromFile(file))
        val manager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        val downloadId = manager.enqueue(request)
        context.registerReceiver(object : BroadcastReceiver() {
            override fun onReceive(c: Context, i: Intent) {
                if (i.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1L) == downloadId) {
                    val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
                    context.startActivity(Intent(Intent.ACTION_VIEW).apply {
                        setDataAndType(uri, "application/vnd.android.package-archive")
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    })
                }
            }
        }, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE))
    }

    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }
}
