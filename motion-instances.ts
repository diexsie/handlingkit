namespace motion {
	export const config: any = {"axes":[{"limits":{"position":{"min":0,"max":0},"velocity":{"min":0,"max":0},"acceleration":{"min":0,"max":0},"torque":{"min":0,"max":0}},"axisParams":{"x":0,"y":0,"z":0,"xr":0,"yr":0,"zr":0},"id":"axis1","address":"axis1"},{"limits":{"position":{"min":0,"max":0},"velocity":{"min":0,"max":0},"acceleration":{"min":0,"max":0},"torque":{"min":0,"max":0}},"axisParams":{"x":0,"y":0,"z":0,"xr":0,"yr":0,"zr":0},"id":"axis2","address":"axis2"}],"kins":[],"points":[]};
	//% fixedInstance whenUsed
	export const axis1 = motion.factory.createAxis('axis1', {"x":0,"y":0,"z":0,"xr":0,"yr":0,"zr":0}, undefined);
	//% fixedInstance whenUsed
	export const axis2 = motion.factory.createAxis('axis2', {"x":0,"y":0,"z":0,"xr":0,"yr":0,"zr":0}, undefined);
	//% fixedInstance whenUsed
	export const axis3 = motion.factory.createAxis('axis3', {"x":0,"y":0,"z":0,"xr":0,"yr":0,"zr":0}, undefined);
}
