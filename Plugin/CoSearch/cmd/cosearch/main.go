package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"cosearch/internal/cosearch"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	cosearch.Run(ctx, os.Stdin, os.Stdout, os.Stderr)
}
