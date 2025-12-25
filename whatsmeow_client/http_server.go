package main

import (
	"context"
	"encoding/json"
	"net/http"
)

type BatchRequest struct {
	Phone      string   `json:"phone"`
	Count      int      `json:"count"`
	IntervalMs int      `json:"interval_ms"`
	Messages   []string `json:"messages"`
}

type BatchResponse struct {
	RTTs []float64 `json:"rtts"`
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func startHTTPServer(ctx context.Context, clientCtx *ClientContext) {
	mux := http.NewServeMux()
	mux.HandleFunc("/send-batch", func(w http.ResponseWriter, r *http.Request) {

		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req BatchRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid json", http.StatusBadRequest)
			return
		}

		if len(req.Messages) == 0 {
			http.Error(w, "messages cannot be empty", http.StatusBadRequest)
			return
		}

		rtts := sendBatchMessages(
			ctx,
			clientCtx,
			req.Phone,
			req.Messages,
			req.Count,
			req.IntervalMs,
		)

		resp := BatchResponse{RTTs: rtts}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	})

	mux.HandleFunc("/send-silent-batch", func(w http.ResponseWriter, r *http.Request) {

		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req BatchRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid json", http.StatusBadRequest)
			return
		}

		// Count check needed, Messages optional
		if req.Count <= 0 {
			req.Count = 1
		}

		rtts := sendSilentBatchMessages(
			ctx,
			clientCtx,
			req.Phone,
			req.Count,
			req.IntervalMs,
		)

		resp := BatchResponse{RTTs: rtts}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	})

	http.ListenAndServe(":8081", corsMiddleware(mux))
}
