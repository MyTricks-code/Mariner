package main

import (
	"context"
	"time"
)

func sendBatchMessages(
	ctx context.Context,
	clientCtx *ClientContext,
	phone string,
	messages []string,
	count int,
	intervalMs int,
) []float64 {

	results := make([]float64, 0, count)

	for i := 0; i < count; i++ {
		text := messages[i%len(messages)]
		msgID, err := sendMessage(ctx, clientCtx.Client, phone, text)
		if err != nil {
			results = append(results, -1.0)
			continue
		}

		// wait for delivery receipt
		var rtt float64 = -1.0

		for j := 0; j < 50; j++ { // ~5s max wait
			mu.Lock()
			timing := receiptData[msgID]
			mu.Unlock()

			if timing != nil && timing.Delivery > 0 {
				// Convert duration to milliseconds with floating point precision
				rtt = float64(timing.Delivery.Nanoseconds()) / 1e6
				break
			}

			time.Sleep(100 * time.Millisecond)
		}

		results = append(results, rtt)
		time.Sleep(time.Duration(intervalMs) * time.Millisecond)
	}

	return results
}

func sendSilentBatchMessages(
	ctx context.Context,
	clientCtx *ClientContext,
	phone string,
	count int,
	intervalMs int,
) []float64 {

	results := make([]float64, 0, count)

	for i := 0; i < count; i++ {
		msgID, err := sendSilentMessage(ctx, clientCtx.Client, phone)
		if err != nil {
			results = append(results, -1.0)
			continue
		}

		// wait for delivery receipt
		var rtt float64 = -1.0

		for j := 0; j < 50; j++ { // ~5s max wait
			mu.Lock()
			timing := receiptData[msgID]
			mu.Unlock()

			if timing != nil && timing.Delivery > 0 {
				rtt = float64(timing.Delivery.Nanoseconds()) / 1e6
				break
			}

			time.Sleep(100 * time.Millisecond)
		}

		results = append(results, rtt)
		time.Sleep(time.Duration(intervalMs) * time.Millisecond)
	}

	return results
}
