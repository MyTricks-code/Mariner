package main

import (
	"time"

	"go.mau.fi/whatsmeow/types/events"
)

func registerReceiptHandler() func(evt interface{}) {
	return func(evt interface{}) {

		receipt, ok := evt.(*events.Receipt)
		if !ok {
			return
		}

		if len(receipt.MessageIDs) == 0 {
			return
		}

		// We only care about DELIVERY
		if receipt.Type != events.ReceiptTypeDelivered {
			return
		}

		msgID := receipt.MessageIDs[0]

		mu.Lock()
		defer mu.Unlock()

		sendTime, exists := sendTimes[msgID]
		if !exists {
			return
		}

		timing, exists := receiptData[msgID]
		if !exists {
			timing = &ReceiptTiming{MessageID: msgID}
			receiptData[msgID] = timing
		}

		if timing.Delivery == 0 {
			timing.Delivery = time.Since(sendTime)
		}
	}
}
