const typeTemplate = '${label} không phải là một ${type} hợp lệ'

/**
 * Bản dịch tiếng Việt các thông báo xác thực form cho Antd-mobile.
 */
export const formValidateMessages = {
	default: 'Lỗi xác thực trên trường ${label}',
	required: '${label} là bắt buộc',
	enum: '${label} phải là một trong những giá trị [${enum}]',
	whitespace: '${label} không được chỉ có các khoảng trắng',

	date: {
		format: '${label} không hợp lệ cho định dạng ngày',
		parse: '${label} không thể phân tích cú pháp như ngày',
		invalid: '${label} là ngày không hợp lệ'
	},

	types: {
		string: typeTemplate,
		method: typeTemplate,
		array: typeTemplate,
		object: typeTemplate,
		number: typeTemplate,
		date: typeTemplate,
		boolean: typeTemplate,
		integer: typeTemplate,
		float: typeTemplate,
		regexp: typeTemplate,
		email: typeTemplate,
		url: typeTemplate,
		hex: typeTemplate
	},

	string: {
		len: '${label} phải chính xác ${len} ký tự',
		min: '${label} phải ít nhất ${min} ký tự',
		max: '${label} không thể nhiều hơn ${max} ký tự',
		range: '${label} phải từ ${min} đến ${max} ký tự'
	},

	number: {
		len: '${label} phải bằng ${len}',
		min: '${label} không thể ít hơn ${min}',
		max: '${label} không thể nhiều hơn ${max}',
		range: '${label} phải từ ${min} đến ${max}'
	},

	array: {
		len: '${label} phải có độ dài chính xác là ${len}',
		min: '${label} phải có độ dài ít hơn ${min}',
		max: '${label} phải có độ dài nhiều hơn ${max}',
		range: '${label} phải có độ dài từ ${min} đến ${max}'
	},

	pattern: {
		mismatch: '${label} không khớp với mẫu ${pattern}'
	}
}
