function C(num,width,heigth){
    return {
        n: num,
        w: width, 
        h: heigth};
}

function draw(){
    ctx.fillStyle="#000";
    ctx.fillRect(0,0,w,h);

    ctx.save();//Al usar translate, la animación de para. Con esto, guardamos el estado de canvas antes de usar translate

    ctx.translate(minTranslateX,minTranslateY);
    ejeX=0;
    ejeY=0;
    for (var i=0;i<casillas.length;i++) {
        ctx.fillStyle="rgb("+Math.floor(Math.random()*256)+","+Math.floor(Math.random()*256)+","+Math.floor(Math.random()*256)+")";
        if(i<11 || i>28){
            ctx.fillRect(ejeX,ejeY,dim*casillas[i].w,dim*casillas[i].h);
            ejeX+=dim;
            if(casillas[i].w==2)
                ejeX+=dim;
        }else if(i>10 && i<29){
            if(i%2!=0)
                ctx.fillRect(ejeX,ejeY,dim*casillas[i].w,dim*casillas[i].h);        
            else{
                ctx.fillRect(dim*11,ejeY,dim*casillas[i].w,dim*casillas[i].h);
                ejeY+=dim;
            }
        }
        if(i==10){
            ejeX=0;
            ejeY=dim*2;
        }
    }
    ctx.fillStyle="rgb("+Math.floor(Math.random()*256)+","+Math.floor(Math.random()*256)+","+Math.floor(Math.random()*256)+")";
    ctx.fillRect(0,0,50,50);

    ctx.restore();//recuperamos el estado de canvas de antes del translate

}

window.onload=function (){
    var canvas = document.getElementById("monopoly");ctx = canvas.getContext("2d");

    w=600;
    h=600;
    zoom=2;    
    dim=w/13*zoom;
    maxTranslateX=0;
    maxTranslateY=0;
    minTranslateX=-6.5*dim;
    minTranslateY=-6.5*dim;
    casillas=[
        C(20,2,2),C(21,1,2),C(22,1,2),C(23,1,2),C(24,1,2),C(25,1,2),C(26,1,2),C(27,1,2),C(28,1,2),C(29,1,2),C(30,2,2),
        C(19,2,1),                                                                                          C(31,2,1),
        C(18,2,1),                                                                                          C(32,2,1),
        C(17,2,1),                                                                                          C(33,2,1),
        C(16,2,1),                                                                                          C(34,2,1),
        C(15,2,1),                                                                                          C(35,2,1),
        C(14,2,1),                                                                                          C(36,2,1),
        C(13,2,1),                                                                                          C(37,2,1),
        C(12,2,1),                                                                                          C(38,2,1),
        C(11,2,1),                                                                                          C(39,2,1),
        C(10,2,2),C(09,1,2),C(08,1,2),C(07,1,2),C(06,1,2),C(05,1,2),C(04,1,2),C(03,1,2),C(02,1,2),C(01,1,2),C(00,2,2)
    ];
    //console.log(casillas);    
    setInterval(draw, 100);
}