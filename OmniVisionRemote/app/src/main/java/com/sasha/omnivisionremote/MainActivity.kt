package com.sasha.omnivisionremote

import android.annotation.SuppressLint
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var irBridge: IRBridge
    private lateinit var btnScan: Button
    private lateinit var txtStatus: TextView
    private var isScanning = false
    private val handler = Handler(Looper.getMainLooper())

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        btnScan = findViewById(R.id.btnScan)
        txtStatus = findViewById(R.id.txtStatus)
        webView = findViewById(R.id.webView)
        irBridge = IRBridge(this)

        // Configurazione WebView
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            }
        }
        webView.webViewClient = WebViewClient()
        webView.addJavascriptInterface(irBridge, "AndroidIR")
        webView.loadUrl("https://deft-chimera-7444a6.netlify.app/")

        // Recupero profilo salvato
        val prefs = getSharedPreferences("OmniVision", MODE_PRIVATE)
        val savedBrand = prefs.getString("saved_brand", "Nessuno")
        txtStatus.text = "Profilo Salvato: $savedBrand"

        btnScan.setOnClickListener {
            if (isScanning) {
                stopScan()
            } else {
                startScan()
            }
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack() else finish()
            }
        })
    }

    private fun startScan() {
        if (!irBridge.hasIrEmitter()) {
            Toast.makeText(this, "Errore: IR non presente", Toast.LENGTH_LONG).show()
            return
        }
        isScanning = true
        btnScan.text = "FERMA E SALVA PROFILO"
        btnScan.setBackgroundColor(android.graphics.Color.RED)
        
        val brands = listOf("Samsung", "LG", "Sony")
        var index = 0

        val runnable = object : Runnable {
            override fun run() {
                if (!isScanning) return
                val brand = brands[index % brands.size]
                txtStatus.text = "Provando: $brand (Premi Ferma se risponde)"
                irBridge.testCodeNativo(brand)
                index++
                handler.postDelayed(this, 3000)
            }
        }
        handler.post(runnable)
    }

    private fun stopScan() {
        isScanning = false
        btnScan.text = "AVVIA SCANSIONE IR"
        btnScan.setBackgroundColor(android.graphics.Color.parseColor("#6200EE"))
        
        // Salvataggio dell'ultimo profilo provato
        val currentBrand = txtStatus.text.toString().replace("Provando: ", "").replace(" (Premi Ferma se risponde)", "")
        val prefs = getSharedPreferences("OmniVision", MODE_PRIVATE)
        prefs.edit().putString("saved_brand", currentBrand).apply()
        
        txtStatus.text = "Profilo Salvato: $currentBrand"
        Toast.makeText(this, "Profilo $currentBrand Salvato correttamente!", Toast.LENGTH_SHORT).show()
    }
}
