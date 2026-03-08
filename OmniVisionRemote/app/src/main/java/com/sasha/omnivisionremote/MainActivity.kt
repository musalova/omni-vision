package com.sasha.omnivisionremote

import android.annotation.SuppressLint
import android.os.Build
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.LinearLayout
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var irBridge: IRBridge

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Creiamo un layout verticale
        val rootLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        // Creiamo il pulsante di Scansione Automatica
        val scanButton = Button(this).apply {
            text = "SCANSIONE AUTOMATICA TV (IR)"
            setOnClickListener {
                irBridge.startAutoScan()
            }
        }

        // Inizializziamo il Bridge
        irBridge = IRBridge(this)

        // Inizializziamo la WebView
        webView = WebView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                0,
                1f // Prende tutto lo spazio rimanente
            )
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            webViewClient = WebViewClient()
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            }
            
            addJavascriptInterface(irBridge, "AndroidIR")
            loadUrl("https://deft-chimera-7444a6.netlify.app/")
        }

        // Aggiungiamo i componenti al layout
        rootLayout.addView(scanButton)
        rootLayout.addView(webView)

        setContentView(rootLayout)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }
}
