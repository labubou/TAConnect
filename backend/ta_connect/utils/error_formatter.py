"""
Utility functions for formatting Django serializer errors
into user-friendly responses for the frontend.
"""

def format_serializer_errors(serializer_errors):
    """
    Format Django serializer errors for frontend consumption.
    
    Args:
        serializer_errors (dict): The serializer.errors dictionary
        
    Returns:
        dict: Formatted error response with 'error' key
        
    Examples:
        >>> errors = {'email': ['This field is required.']}
        >>> format_serializer_errors(errors)
        {'error': 'email: This field is required.'}
        
        >>> errors = {'email': ['Invalid email.'], 'password': ['Too short.']}
        >>> format_serializer_errors(errors)
        {'error': {'email': ['Invalid email.'], 'password': ['Too short.']}}
    """
    if not serializer_errors:
        return {'error': 'Validation error'}
    
    # If there's only one field with one error, return a simple string
    if len(serializer_errors) == 1:
        field, messages = next(iter(serializer_errors.items()))
        if isinstance(messages, list) and len(messages) == 1:
            # Format: "field_name: Error message"
            return {'error': f"{format_field_name(field)}: {messages[0]}"}
    
    # Otherwise return structured errors for multiple fields
    return {'error': serializer_errors}


def format_field_name(field_name):
    """
    Convert snake_case field names to Title Case for display.
    
    Args:
        field_name (str): Field name in snake_case
        
    Returns:
        str: Formatted field name in Title Case
        
    Examples:
        >>> format_field_name('email_address')
        'Email Address'
        >>> format_field_name('first_name')
        'First Name'
    """
    return field_name.replace('_', ' ').title()


def get_first_error_message(serializer_errors):
    """
    Extract the first error message from serializer errors.
    Useful for displaying a single error message to the user.
    
    Args:
        serializer_errors (dict): The serializer.errors dictionary
        
    Returns:
        str: The first error message found
        
    Example:
        >>> errors = {'email': ['Invalid email.'], 'password': ['Too short.']}
        >>> get_first_error_message(errors)
        'Email: Invalid email.'
    """
    if not serializer_errors:
        return 'Validation error'
    
    # Get the first field and its errors
    field, messages = next(iter(serializer_errors.items()))
    
    if isinstance(messages, list) and messages:
        return f"{format_field_name(field)}: {messages[0]}"
    elif isinstance(messages, dict):
        # Handle nested errors
        return f"{format_field_name(field)}: {str(messages)}"
    else:
        return str(messages)


def format_validation_error(serializer_errors, custom_message=None):
    """
    Create a complete error response with optional custom message.
    
    Args:
        serializer_errors (dict): The serializer.errors dictionary
        custom_message (str, optional): Custom message to include
        
    Returns:
        dict: Complete error response with error and optional message
        
    Example:
        >>> errors = {'email': ['Required field.']}
        >>> format_validation_error(errors, 'Please check your input')
        {
            'error': 'Email: Required field.',
            'message': 'Please check your input'
        }
    """
    response = format_serializer_errors(serializer_errors)
    
    if custom_message:
        response['message'] = custom_message
    
    return response
