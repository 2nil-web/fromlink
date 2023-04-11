#!env wish
#
set NPerson 0
set Persons {}

proc NewPerson {} {
	global NPerson Persons
	set personName "person$NPerson"
	incr NPerson
	lappend Persons $personName
	
	upvar #0 $personName person
	set person(editWindow) {}
	
	return $personName
}

proc EditPerson {personName} {
	upvar #0 $personName person
	
	if [winfo exist $person(editWindow)] {
		return
	}

	set edit [toplevel .edit$personName]
	wm title $edit "Personne"
	
	foreach {field title} {nom "Nom :" prenom "Prenom :" tel "Telephone :" email "Email :"} {
		frame $edit.$field
		label $edit.$field.title -text $title
		entry $edit.$field.edit -textvariable $personName\($field\)
		
		pack $edit.$field.title -side left -padx 5 -pady 5
		pack $edit.$field.edit -side left -padx 5 -pady 5 -expand on -fill x
		pack $edit.$field -side top -expand on -fill x
	}
	set person(editWindow) $edit
	
	button $edit.print -text Imprimer -command "PrintPerson $personName"
	button $edit.ok -text OK -command "destroy $edit"
	pack $edit.ok -side right -padx 5 -pady 5
	pack $edit.print -side right -padx 5 -pady 5
}

proc SearchPerson {nom} {
	global Persons
	set found 0
	
	foreach personName $Persons {
		upvar #0 $personName person
		if {$person(nom) == $nom} {
			EditPerson $personName
			incr found
		}
	}
	
	if {$found == 0} {
		tk_messageBox -type ok -message "ll n'y a personne avec le nom $nom"
	}
}

proc PrintPerson {personName} {
	upvar #0 $personName person
	puts "$person(prenom) $person(nom), $person(tel), $person(email)"
}


button .new -text "Nouvelle personne" -command {EditPerson [NewPerson]}

entry .name -textvariable searchName -width 20
bind .name <Key-Return> {.search invoke}

button .search -text "Chercher" -command {SearchPerson $searchName}

button .print -text "Imprimer tout" -command {foreach personName $Persons {PrintPerson $personName}}

button .quit -text "Quitter" -command {destroy .}

pack .new -side top -padx 5 -pady 5 -fill x
pack .quit -side bottom -padx 5 -pady 5 -fill x
pack .print -side bottom -padx 5 -pady 5 -fill x
pack .search -side left -padx 5 -pady 5
pack .name -side left -padx 5 -pady 5 -fill x

wm title . Agenda
