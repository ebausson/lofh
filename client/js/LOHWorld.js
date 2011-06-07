function World()
{
	var objets=new Array();
	objets.push(new Carre());
	var hexa0=new Hexagone();
	objets.push(hexa0);
	var perso=new Carre();


	this.draw=function(context)
	{
		perso.draw(context);
		for(i=0;i<objets.length;i++)
		{
			objets[i].draw(context);
		}
	}
	this.move=function(move_)
	{
		for(i=0;i<objets.length;i++)
		{
			objets[i].move(move_);
		}
	}
}