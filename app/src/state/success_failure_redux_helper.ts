//credit: https://medium.com/skyshidigital/simplify-redux-request-success-failure-pattern-ce77340eae06#:~:text=Request%20Success%20Failure%20is%20common,can%20display%20nice%20loading%20indicator.
export function reduxHelper (actionName, fn) {
    if (typeof actionName !== 'string') {
        throw new Error('actionName must be a string')
    }
    if (typeof fn !== 'function') {
        throw new Error('fn must be a function')
    }
    const actionNameUpper = actionName.toUpperCase()
    const actionRequest = actionNameUpper + '_REQUEST'
    const actionSuccess = actionNameUpper + '_SUCCESS'
    const actionFailure = actionNameUpper + '_FAILURE'

    const initialState = {
        data: null,
        loading: false,
        error: null
    }

    const reducer = (state = initialState, action) => {
        switch (action.type) {
            case actionRequest:
                return {
                    ...state,
                    loading: true
                }

            case actionSuccess:
                return {
                    ...state,
                    loading: false,
                    data: action.data !== undefined ? action.data : null
                }

            case actionFailure:
                return {
                    ...state,
                    loading: false,
                    error: action.error
                }
        
            default:
                return state
        }
    }

    // we are not using arrow function, because there no arguments binding
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/Arrow_functions
    const action = function () {
        const args = arguments
        return dispatch => {   
            dispatch({
                type: actionRequest
            })
            try {
                const result = fn.apply(null, args)
                // It's a promise
                if (typeof result.then === 'function') {
                    result.then(data => dispatch({
                        type: actionSuccess,
                        data
                    }))
                    .catch(error => dispatch({
                        type: actionFailure,
                        error
                    }))
                } else {
                    dispatch({
                        type: actionSuccess,
                        data: result
                    })
                }
            } catch (error) {
                dispatch({
                    type: actionFailure,
                    error
                })
            }
        }
    }

    return {
        action,
        actionTypes: {
            request: actionRequest,
            success: actionSuccess,
            failure: actionFailure
        },
        reducer
    }
}