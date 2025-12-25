package main

import (
	"sync"
	"time"
)

type ReceiptTiming struct {
	MessageID string
	Delivery  time.Duration
}

var (
	mu          sync.Mutex
	sendTimes   = make(map[string]time.Time)
	receiptData = make(map[string]*ReceiptTiming)
)
