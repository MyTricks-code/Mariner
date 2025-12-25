package main

import (
	"context"
	"fmt"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"

	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/store/sqlstore"
	"go.mau.fi/whatsmeow/types/events"
	waLog "go.mau.fi/whatsmeow/util/log"
)

func main() {
	ctx := context.Background()

	// Load env (safe if .env missing)
	_ = godotenv.Load()

	logger := waLog.Stdout("WhatsMeow", "INFO", true)

	// --- SQL store (session persistence) ---
	container, err := sqlstore.New(
		ctx,
		"sqlite3",
		"file:whatsmeow.db?_foreign_keys=on",
		logger,
	)
	if err != nil {
		panic(err)
	}

	device, err := container.GetFirstDevice(ctx)
	if err != nil {
		panic(err)
	}

	// --- WhatsMeow client ---
	client := whatsmeow.NewClient(device, logger)

	// --- Receipt handler (tick-1 delivery RTT) ---
	client.AddEventHandler(registerReceiptHandler())

	// --- Connection logs (optional) ---
	client.AddEventHandler(func(evt interface{}) {
		switch evt.(type) {
		case *events.Connected:
			fmt.Println("✅ Connected to WhatsApp")
		case *events.Disconnected:
			fmt.Println("❌ Disconnected from WhatsApp")
		}
	})

	// --- Connect ---
	err = client.Connect()
	if err != nil {
		panic(err)
	}

	// --- Client context (shared with HTTP server) ---
	clientCtx := &ClientContext{
		Client: client,
	}

	// --- Start HTTP server for FastAPI ---
	go startHTTPServer(ctx, clientCtx)

	port := os.Getenv("WHATSMeOW_PORT")
	if port == "" {
		port = "8081"
	}

	fmt.Println("🚀 WhatsMeow HTTP server running on port", port)

	// --- Keep process alive ---
	select {}
}
