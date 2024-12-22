// Layout config and defaults

export const DEFAULT_LAYOUT = 'basic'

export const layouts = {
	// basic layout (default)
	basic: {
		name: 'Basic',
		thumbnail: '',
		options: {
			colour_button1: {
				name: "Button 1 background colour",
				type: "colour",
			},
			text_colour_button1: {
				name: "Button 1 text colour",
				type: "colour",
			},
			colour_button2: {
				name: "Button 2 background colour",
				type: "colour",
			},
			text_colour_button2: {
				name: "Button 2 text colour",
				type: "colour",
			},
			colour_button3: {
				name: "Button 3 background colour",
				type: "colour",
			},
			text_colour_button3: {
				name: "Button 3 text colour",
				type: "colour",
			},
			colour_button4: {
				name: "Button 4 background colour",
				type: "colour",
			},
			text_colour_button4: {
				name: "Button 4 text colour",
				type: "colour",
			},
			colour_background: {
				name: "Background colour",
				type: "colour",
			},
			colour_timer: {
				name: "Timer indicator colour",
				type: "colour",
			},
			colour_message: {
				name: "Message colour",
				type: "colour",
			}
		}
	},
	// 4 buttons horizontal layout
	btn_4_horiz: {
		name: "4 button horizontal",
		thumbnail: '',
		options: {
			button_height: {
				name: "Button height (default is 30)",
				type: "number",
			},
			button_align: {
				name: "Button text vertical alignment",
				type: {
					"flex-start": "Top",
					"center": "Middle",
					"flex-end": "Bottom"
				}
			},
			colour_button1: {
				name: "Button 1 background colour",
				type: "colour",
			},
			text_colour_button1: {
				name: "Button 1 text colour",
				type: "colour",
			},
			colour_button2: {
				name: "Button 2 background colour",
				type: "colour",
			},
			text_colour_button2: {
				name: "Button 2 text colour",
				type: "colour",
			},
			colour_button3: {
				name: "Button 3 background colour",
				type: "colour",
			},
			text_colour_button3: {
				name: "Button 3 text colour",
				type: "colour",
			},
			colour_button4: {
				name: "Button 4 background colour",
				type: "colour",
			},
			text_colour_button4: {
				name: "Button 4 text colour",
				type: "colour",
			},
			colour_background: {
				name: "Background colour",
				type: "colour",
			},
			colour_timer: {
				name: "Timer indicator colour",
				type: "colour",
			},
			colour_message: {
				name: "Message colour",
				type: "colour",
			}
		}
	}
}


/*

Option types can be:

colour - a colour, obviously (bring up a picker - make sure transparency is available too)
font - a simple choice between a few fonts? (Check with Ryan)
[Object] - a way of choosing more complex bits of css:
	{
		"css_var_name" : {
			"css_var_value": "human readable description",
			"10px 20px 30px 20px": "Margin style 1"
		}
	}

*/