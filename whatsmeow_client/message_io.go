package main

import (
	"context"
	"time"

	"go.mau.fi/whatsmeow"
	waProto "go.mau.fi/whatsmeow/binary/proto"
	"go.mau.fi/whatsmeow/types"
	"google.golang.org/protobuf/proto"
)

func sendMessage(
	ctx context.Context,
	client *whatsmeow.Client,
	phone string,
	text string,
) (string, error) {

	jid := types.NewJID(phone, "s.whatsapp.net")

	msg := &waProto.Message{
		Conversation: proto.String(text),
	}

	resp, err := client.SendMessage(ctx, jid, msg)
	if err != nil {
		return "", err
	}

	mu.Lock()
	sendTimes[resp.ID] = time.Now()
	mu.Unlock()

	return resp.ID, nil
}

func sendSilentMessage(
	ctx context.Context,
	client *whatsmeow.Client,
	phone string,
) (string, error) {

	jid := types.NewJID(phone, "s.whatsapp.net")

	// Generate a random ID to "revoke"
	fakeID := client.GenerateMessageID()

	msg := &waProto.Message{
		ProtocolMessage: &waProto.ProtocolMessage{
			Type: waProto.ProtocolMessage_REVOKE.Enum(),
			Key: &waProto.MessageKey{
				RemoteJID: proto.String(jid.String()),
				FromMe:    proto.Bool(true),
				ID:        proto.String(fakeID),
			},
		},
	}

	resp, err := client.SendMessage(ctx, jid, msg)
	if err != nil {
		return "", err
	}

	mu.Lock()
	sendTimes[resp.ID] = time.Now()
	mu.Unlock()

	return resp.ID, nil
}
