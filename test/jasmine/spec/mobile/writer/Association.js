Ext.require([
	'Ext.data.Model',
	'Tutti.writer.Association'
]);

describe("Tutti.writer.Association", function() {
	var writer;
	
	prep(function() {
		writer = new Tutti.writer.Association();
	});
	
	it("should write hasOne associations", function() {
		var recordData = {
			id: 1,
			name: 'Submarine'
		};
		
		var subrecordData = {
			id: 42,
			color: 'tangerine'
		};
		
		var Submodel = Ext.define(classname('Submodel'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id', 'color']
			}
		});
		
		var subrecord = new Submodel(subrecordData);
		
		var Model = Ext.define(classname('Model'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id', 'name'],
				
				hasOne: {
					model: Ext.getClassName(Submodel),
					setterName: 'setFavorite',
					associationKey: 'favorite'
				}
			}
		});
		
		var record = new Model(recordData);
		
		record.setFavorite(subrecord);
		
		expect(writer.getRecordData(record))
			.toEqual(
				Ext.apply(
					{
						favorite: subrecordData
					},
					recordData
				)
			);
	});
	
	it("should write belongsTo associations", function() {
		var recordData = {
			id: 1,
			name: 'Fido',
			breed: 'labradoodle'
		};
		
		var subrecordData = {
			id: 42,
			name: 'Old MacDonald'
		};
		
		var Submodel = Ext.define(classname('Submodel'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id', 'name']
			}
		});
		
		var subrecord = new Submodel(subrecordData);
		
		var Model = Ext.define(classname('Model'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id', 'name', 'breed'],
				
				belongsTo: {
					model: Ext.getClassName(Submodel),
					setterName: 'setOwner',
					associationKey: 'owner'
				}
			}
		});
		
		var record = new Model(recordData);
		
		record.setOwner(subrecord);
		
		expect(writer.getRecordData(record))
			.toEqual(
				Ext.apply(
					{
						owner: subrecordData
					},
					recordData
				)
			);
	});
	
	it("should write hasMany associations", function() {
		var recordData = {
			id: 1,
			name: 'Joseph'
		};
		
		var subrecordData = [
			{
				id: 2,
				color: 'scarlet'
			},
			{
				id: 3,
				color: 'ochre'
			},
			{
				id: 4,
				color: 'peach'
			}
		];
		
		var Submodel = Ext.define(classname('Submodel'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id', 'color']
			}
		});
		
		var Model = Ext.define(classname('Model'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id', 'name'],
				
				hasMany: {
					model: Ext.getClassName(Submodel),
					associationKey: 'colors',
					name: 'getColors'
				}
			}
		});
		
		var record = new Model(recordData);
		
		record.getColors().add(subrecordData);
		
		
		expect(writer.getRecordData(record))
			.toEqual(
				Ext.apply(
					{
						colors: subrecordData
					},
					recordData
				)
			);
	});
	
	it("should write nested associations", function() {
		var recordData = {
			id: 'solar-system',
			galaxy: 'milky way'
		};
		
		var subrecordData = {
			id: 'earth',
			habitable: true
		};
		
		var subsubrecordData = [
			{
				id: 1,
				element: 'nitrogen'
			},
			{
				id: 2,
				element: 'oxygen'
			},
			{
				id: 3,
				element: 'methane'
			}
		];
		
		var submodelName = classname('Submodel');
		
		var Subsubmodel = Ext.define(classname('Subsubmodel'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id', 'element'],
				
				belongsTo: {
					model: submodelName,
					setterName: 'setPlanet',
					associationKey: 'planet'
				}
			}
		});
		
		var Submodel = Ext.define(submodelName, {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id', 'habitable'],
				
				hasMany: {
					model: Ext.getClassName(Subsubmodel),
					associationKey: 'atmosphere',
					name: 'getAtmosphere'
				}
			}
		});
		
		var Model = Ext.define(classname('Model'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id', 'galaxy'],
				
				hasOne: {
					model: Ext.getClassName(Submodel),
					setterName: 'setLife',
					associationKey: 'life'
				}
			}
		});
		
		var record = new Model(recordData);
		var subrecord = new Submodel(subrecordData);
		
		record.setLife(subrecord);
		subrecord.getAtmosphere().add(subsubrecordData);
		
		expect(writer.getRecordData(record))
			.toEqual(
				Ext.apply(
					{
						life: Ext.apply(
							{
								atmosphere: subsubrecordData
							},
							subrecordData
						)
					},
					recordData
				)
			);
	});
});
