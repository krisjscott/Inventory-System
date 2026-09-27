package com.example.orderapi.exception;

public class ResourceNotFoundException extends RuntimeException {

    private final String resourceName;
    private final Object fieldValue;

    public ResourceNotFoundException(String resourceName, Object fieldValue) {
        super(resourceName + " not found with id " + fieldValue);
        this.resourceName = resourceName;
        this.fieldValue = fieldValue;
    }

    public ResourceNotFoundException(String message) {
        super(message);
        this.resourceName = "Resource";
        this.fieldValue = null;
    }

    public String getResourceName() {
        return resourceName;
    }

    public Object getFieldValue() {
        return fieldValue;
    }
}
