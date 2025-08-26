const {
    handleValidationErrors,
    validateMemberRegistration,
    validateMemberLogin,
    validatePasswordChange,
    validateOTPGeneration,
    validateOTPVerification,
    validateMemberId,
    validateCommittee,
    validateTaskCreation,
    validateTaskRating
} = require('../../../middleware/validation');

// Mock express-validator
jest.mock('express-validator', () => ({
    body: jest.fn(() => ({
        trim: jest.fn().mockReturnThis(),
        isLength: jest.fn().mockReturnThis(),
        matches: jest.fn().mockReturnThis(),
        isEmail: jest.fn().mockReturnThis(),
        normalizeEmail: jest.fn().mockReturnThis(),
        isIn: jest.fn().mockReturnThis(),
        notEmpty: jest.fn().mockReturnThis(),
        withMessage: jest.fn().mockReturnThis(),
        isDate: jest.fn().mockReturnThis(),
        isNumeric: jest.fn().mockReturnThis(),
        optional: jest.fn().mockReturnThis(),
        custom: jest.fn().mockReturnThis(),
        isISO8601: jest.fn().mockReturnThis(),
        isFloat: jest.fn().mockReturnThis()
    })),
    param: jest.fn(() => ({
        isMongoId: jest.fn().mockReturnThis(),
        isIn: jest.fn().mockReturnThis(),
        withMessage: jest.fn().mockReturnThis(),
        matches: jest.fn().mockReturnThis()
    })),
    query: jest.fn(() => ({
        isIn: jest.fn().mockReturnThis(),
        withMessage: jest.fn().mockReturnThis()
    })),
    validationResult: jest.fn()
}));

describe('Validation Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            body: {},
            params: {},
            query: {}
        };
        mockRes = {};
        mockNext = jest.fn();
        
        // Reset mocks
        jest.clearAllMocks();
    });

    describe('handleValidationErrors', () => {
        it('should call next() when no validation errors', () => {
            const { validationResult } = require('express-validator');
            validationResult.mockReturnValue({
                isEmpty: () => true,
                array: () => []
            });

            handleValidationErrors(mockReq, mockRes, mockNext);
            
            expect(mockNext).toHaveBeenCalledWith();
        });

        it('should call next with error when validation fails', () => {
            const { validationResult } = require('express-validator');
            validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => [{ param: 'email', msg: 'Invalid email' }]
            });

            handleValidationErrors(mockReq, mockRes, mockNext);
            
            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
            expect(mockNext.mock.calls[0][0].message).toContain('Validation failed: email: Invalid email');
        });
    });

    describe('validateMemberRegistration', () => {
        it('should have the correct number of validation rules', () => {
            // Should have 6 validation rules + handleValidationErrors
            expect(validateMemberRegistration).toHaveLength(7);
        });

        it('should include name validation', () => {
            const nameValidator = validateMemberRegistration[0];
            expect(nameValidator).toBeDefined();
        });

        it('should include email validation', () => {
            const emailValidator = validateMemberRegistration[1];
            expect(emailValidator).toBeDefined();
        });

        it('should include password validation', () => {
            const passwordValidator = validateMemberRegistration[2];
            expect(passwordValidator).toBeDefined();
        });

        it('should include committee validation', () => {
            const committeeValidator = validateMemberRegistration[3];
            expect(committeeValidator).toBeDefined();
        });

        it('should include gender validation', () => {
            const genderValidator = validateMemberRegistration[4];
            expect(genderValidator).toBeDefined();
        });

        it('should include phone validation', () => {
            const phoneValidator = validateMemberRegistration[5];
            expect(phoneValidator).toBeDefined();
        });

        it('should end with handleValidationErrors', () => {
            const lastValidator = validateMemberRegistration[validateMemberRegistration.length - 1];
            expect(lastValidator).toBe(handleValidationErrors);
        });
    });

    describe('validateMemberLogin', () => {
        it('should have the correct number of validation rules', () => {
            // Should have 2 validation rules + handleValidationErrors
            expect(validateMemberLogin).toHaveLength(3);
        });

        it('should include email validation', () => {
            const emailValidator = validateMemberLogin[0];
            expect(emailValidator).toBeDefined();
        });

        it('should include password validation', () => {
            const passwordValidator = validateMemberLogin[1];
            expect(passwordValidator).toBeDefined();
        });

        it('should end with handleValidationErrors', () => {
            const lastValidator = validateMemberLogin[validateMemberLogin.length - 1];
            expect(lastValidator).toBe(handleValidationErrors);
        });
    });

    describe('validatePasswordChange', () => {
        it('should have the correct number of validation rules', () => {
            // Should have 2 validation rules + handleValidationErrors
            expect(validatePasswordChange).toHaveLength(3);
        });

        it('should include current password validation', () => {
            const currentPasswordValidator = validatePasswordChange[0];
            expect(currentPasswordValidator).toBeDefined();
        });

        it('should include new password validation', () => {
            const newPasswordValidator = validatePasswordChange[1];
            expect(newPasswordValidator).toBeDefined();
        });

        it('should end with handleValidationErrors', () => {
            const lastValidator = validatePasswordChange[validatePasswordChange.length - 1];
            expect(lastValidator).toBe(handleValidationErrors);
        });
    });

    describe('validateOTPGeneration', () => {
        it('should have the correct number of validation rules', () => {
            // Should have 1 validation rule + handleValidationErrors
            expect(validateOTPGeneration).toHaveLength(2);
        });

        it('should include email validation', () => {
            const emailValidator = validateOTPGeneration[0];
            expect(emailValidator).toBeDefined();
        });

        it('should end with handleValidationErrors', () => {
            const lastValidator = validateOTPGeneration[validateOTPGeneration.length - 1];
            expect(lastValidator).toBe(handleValidationErrors);
        });
    });

    describe('validateOTPVerification', () => {
        it('should have the correct number of validation rules', () => {
            // Should have 2 validation rules + handleValidationErrors
            expect(validateOTPVerification).toHaveLength(3);
        });

        it('should include email validation', () => {
            const emailValidator = validateOTPVerification[0];
            expect(emailValidator).toBeDefined();
        });

        it('should include OTP validation', () => {
            const otpValidator = validateOTPVerification[1];
            expect(otpValidator).toBeDefined();
        });

        it('should end with handleValidationErrors', () => {
            const lastValidator = validateOTPVerification[validateOTPVerification.length - 1];
            expect(lastValidator).toBe(handleValidationErrors);
        });
    });

    describe('validateMemberId', () => {
        it('should have the correct number of validation rules', () => {
            // Should have 1 validation rule + handleValidationErrors
            expect(validateMemberId).toHaveLength(2);
        });

        it('should include ID validation', () => {
            const idValidator = validateMemberId[0];
            expect(idValidator).toBeDefined();
        });

        it('should end with handleValidationErrors', () => {
            const lastValidator = validateMemberId[validateMemberId.length - 1];
            expect(lastValidator).toBe(handleValidationErrors);
        });
    });

    describe('validateCommittee', () => {
        it('should have the correct number of validation rules', () => {
            // Should have 1 validation rule + handleValidationErrors
            expect(validateCommittee).toHaveLength(2);
        });

        it('should include committee validation', () => {
            const committeeValidator = validateCommittee[0];
            expect(committeeValidator).toBeDefined();
        });

        it('should end with handleValidationErrors', () => {
            const lastValidator = validateCommittee[validateCommittee.length - 1];
            expect(lastValidator).toBe(handleValidationErrors);
        });
    });

    describe('Validation Structure', () => {
        it('should have consistent structure across all validators', () => {
            const allValidators = [
                validateMemberRegistration,
                validateMemberLogin,
                validatePasswordChange,
                validateOTPGeneration,
                validateOTPVerification,
                validateMemberId,
                validateCommittee,
                validateTaskCreation,
                validateTaskRating
            ];

            allValidators.forEach(validator => {
                expect(Array.isArray(validator)).toBe(true);
                expect(validator.length).toBeGreaterThan(0);
                expect(validator[validator.length - 1]).toBe(handleValidationErrors);
            });
        });
    });

    describe('validateTaskCreation', () => {
        it('should have the correct number of validation rules', () => {
            // Should have 4 validation rules + handleValidationErrors
            expect(validateTaskCreation).toHaveLength(5);
        });

        it('should include title validation', () => {
            const titleValidator = validateTaskCreation[0];
            expect(titleValidator).toBeDefined();
        });

        it('should include description validation', () => {
            const descriptionValidator = validateTaskCreation[1];
            expect(descriptionValidator).toBeDefined();
        });

        it('should include deadline validation', () => {
            const deadlineValidator = validateTaskCreation[2];
            expect(deadlineValidator).toBeDefined();
        });

        it('should include points validation', () => {
            const pointsValidator = validateTaskCreation[3];
            expect(pointsValidator).toBeDefined();
        });

        it('should end with handleValidationErrors', () => {
            const lastValidator = validateTaskCreation[validateTaskCreation.length - 1];
            expect(lastValidator).toBe(handleValidationErrors);
        });
    });

    describe('validateTaskRating', () => {
        it('should have the correct number of validation rules', () => {
            // Should have 2 validation rules + handleValidationErrors
            expect(validateTaskRating).toHaveLength(3);
        });

        it('should include rate validation', () => {
            const rateValidator = validateTaskRating[0];
            expect(rateValidator).toBeDefined();
        });

        it('should include notes validation', () => {
            const notesValidator = validateTaskRating[1];
            expect(notesValidator).toBeDefined();
        });

        it('should end with handleValidationErrors', () => {
            const lastValidator = validateTaskRating[validateTaskRating.length - 1];
            expect(lastValidator).toBe(handleValidationErrors);
        });
    });
});
