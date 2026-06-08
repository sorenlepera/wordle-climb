package com.wordle.dto;

public record StatusResponse(boolean aiConnected, String model, int cacheSize) {}
