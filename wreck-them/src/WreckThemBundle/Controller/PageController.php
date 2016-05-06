<?php

namespace WreckThemBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class PageController extends Controller
{
    public function indexAction()
    {
        return $this->render('WreckThemBundle::index.html.twig');
    }
}
