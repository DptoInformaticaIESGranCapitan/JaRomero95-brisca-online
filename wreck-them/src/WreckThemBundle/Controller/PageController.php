<?php

namespace WreckThemBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class PageController extends Controller
{
    public function indexAction()
    {
        return $this->render('WreckThemBundle:Page:index.html.twig');
    }

    public function playAction()
    {
        return $this->render('WreckThemBundle:Game:game.html.twig');
    }
}
