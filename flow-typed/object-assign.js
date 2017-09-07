declare module 'object-assign' {
    declare module.exports:
        <T>(target: {[string]: T}, ...sources: Array<{[string]: T}>)
            => {[string]: T};
}

